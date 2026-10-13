// @ts-nocheck -- temporary: schema migration in progress
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const candidateOptions = (userId: string) => queryOptions({
  queryKey: ["candidate-profile", userId],
  queryFn: async () => {
    const [candidate, profile] = await Promise.all([
      supabase.from("candidate_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name,phone,email").eq("id", userId).single(),
    ]);
    if (candidate.error || profile.error) throw new Error("Impossible de charger votre profil.");
    return { candidate: candidate.data, name: profile.data.full_name, phone: profile.data.phone, email: profile.data.email };
  },
});

export const candidateActivityOptions = (userId: string) => queryOptions({
  queryKey: ["candidate-activity", userId],
  queryFn: async () => {
    const [applications, alerts] = await Promise.all([
      supabase.from("applications").select("*").eq("candidate_id", userId).order("created_at", { ascending: false }),
      supabase.from("candidate_alerts").select("*").eq("candidate_id", userId).order("created_at", { ascending: false }),
    ]);
    if (applications.error || alerts.error) throw new Error("Impossible de charger vos candidatures et alertes.");
    const jobIds = [...new Set(applications.data.map((application) => application.job_id))];
    const jobs = jobIds.length
      ? await supabase.from("jobs").select("id,title,company_name,location,contract").in("id", jobIds)
      : { data: [], error: null };
    if (jobs.error) throw new Error("Impossible de charger les offres de vos candidatures.");
    return {
      applications: applications.data.map((application) => ({
        ...application,
        job: jobs.data.find((job) => job.id === application.job_id),
      })),
      alerts: alerts.data,
    };
  },
});