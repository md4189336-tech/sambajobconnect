// @ts-nocheck -- temporary: schema migration in progress
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const recruiterOptions = (userId: string) => queryOptions({
  queryKey: ["recruiter-workspace", userId],
  queryFn: async () => {
    const [legacyCompany, company, jobs, candidates, shortlists] = await Promise.all([
      supabase.from("company_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("companies").select("*").eq("owner_id", userId).maybeSingle(),
      supabase.from("jobs").select("*").eq("recruiter_id", userId).order("created_at", { ascending: false }),
      supabase.from("candidate_profiles").select("user_id,display_name,headline,location,sector,job_title,experience,skills,education,experience_details,resume_path,updated_at").eq("is_visible", true).order("updated_at", { ascending: false }),
      supabase.from("candidate_shortlists").select("candidate_id,created_at").eq("recruiter_id", userId),
    ]);
    if (legacyCompany.error || jobs.error || candidates.error || shortlists.error) throw new Error("Impossible de charger votre espace entreprise.");
    if (company.error) {
      console.error("[Espace entreprise] Impossible de lire companies :", company.error.message);
    }
    const companyData = legacyCompany.data ? {
      ...legacyCompany.data,
      sector_id: company.data?.sector_id ?? null,
    } : company.data ? {
      user_id: company.data.owner_id,
      company_name: company.data.name,
      registration_number: "",
      sector_id: company.data.sector_id,
      website: company.data.website ?? "",
      country: company.data.country,
      city: company.data.city,
      description: company.data.description,
      verification_status: company.data.is_verified ? "verified" : "unverified",
      verification_note: "",
      verified_at: null,
      updated_at: company.data.created_at,
    } : null;
    const jobIds = jobs.data.map((job) => job.id);
    if (!jobIds.length) return { company: companyData, jobs: jobs.data, applications: [], candidates: candidates.data, shortlists: shortlists.data };
    const { data: applications, error: applicationError } = await supabase.from("applications").select("*").in("job_id", jobIds).order("created_at", { ascending: false });
    if (applicationError) throw new Error("Impossible de charger les candidatures.");
    const candidateIds = [...new Set(applications.map((application) => application.candidate_id))];
    const [applicantProfiles, contacts] = candidateIds.length ? await Promise.all([
      supabase.from("candidate_profiles").select("user_id,display_name,headline,location,sector,job_title,experience,skills,education,experience_details,resume_path,updated_at").in("user_id", candidateIds),
      supabase.from("profiles").select("id,full_name,email,phone").in("id", candidateIds),
    ]) : [{ data: [], error: null }, { data: [], error: null }];
    if (applicantProfiles.error || contacts.error) throw new Error("Impossible de charger les coordonnées des candidats.");
    return {
      company: companyData,
      jobs: jobs.data,
      candidates: candidates.data,
      shortlists: shortlists.data,
      applications: applications.map((application) => {
        const profile = applicantProfiles.data.find((candidate) => candidate.user_id === application.candidate_id);
        const contact = contacts.data.find((candidate) => candidate.id === application.candidate_id);
        return {
          ...application,
          job: jobs.data.find((job) => job.id === application.job_id),
          candidate: {
            ...profile,
            user_id: application.candidate_id,
            display_name: profile?.display_name || contact?.full_name || application.candidate_name,
            email: contact?.email || application.candidate_email,
            phone: contact?.phone || application.candidate_phone,
            resume_path: application.cv_url || profile?.resume_path || null,
          },
        };
      }),
    };
  },
  staleTime: 15_000,
});
