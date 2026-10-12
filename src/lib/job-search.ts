import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PublicJobFilters = {
  q?: string;
  location?: string;
  country?: string;
  sector?: string;
  sector_id?: string;
  job_title?: string;
  contract?: string;
  experience?: string;
  degree?: string;
  remote?: boolean;
  min_salary?: number;
  max_salary?: number;
  max_days?: number;
  sort?: "recent" | "salary" | "relevance";
};

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];

function normalizeLegacyJob(job: {
  id: string;
  title: string;
  description: string;
  sector: string;
  job_title: string;
  location: string;
  country: string;
  company_name: string;
  contract: string;
  created_at: string;
  status: string;
  salary_min: number | null;
  salary_max: number | null;
  experience: string;
  required_degree: string;
  remote: boolean;
  recruiter_id: string;
}): JobRow {
  return {
    ...job,
    sector_id: null,
    company_id: null,
    city: job.location,
    contract_type: job.contract,
    education_level: job.required_degree,
    experience_level: job.experience,
    is_featured: false,
    is_remote: job.remote,
    salary_range: null,
  };
}

export const publicJobsOptions = (filters: PublicJobFilters, sectorId?: string) =>
  queryOptions({
    queryKey: ["public-jobs", filters, sectorId],
    queryFn: async (): Promise<JobRow[]> => {
      const safeQuery = filters.q?.trim().replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
      let query = supabase.from("jobs").select("*").eq("status", "published");

      if (filters.country) query = query.eq("country", filters.country);
      if (filters.location) query = query.ilike("city", `%${filters.location}%`);
      const resolvedSectorId = filters.sector_id ?? sectorId;
      if (resolvedSectorId && /^[0-9a-f-]{36}$/i.test(resolvedSectorId)) {
        query = query.eq("sector_id", resolvedSectorId);
      } else if (filters.sector) query = query.eq("sector", filters.sector);
      if (filters.job_title) query = query.ilike("job_title", `%${filters.job_title}%`);
      if (filters.contract) query = query.eq("contract_type", filters.contract);
      if (filters.experience) query = query.eq("experience_level", filters.experience);
      if (filters.degree) query = query.ilike("education_level", `%${filters.degree}%`);
      if (filters.remote !== undefined) query = query.eq("is_remote", filters.remote);
      if (filters.min_salary !== undefined) query = query.gte("salary_max", filters.min_salary);
      if (filters.max_salary !== undefined) query = query.lte("salary_min", filters.max_salary);
      if (filters.max_days !== undefined) {
        query = query.gte("created_at", new Date(Date.now() - filters.max_days * 86_400_000).toISOString());
      }
      if (safeQuery) {
        query = query.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,job_title.ilike.%${safeQuery}%`,
        );
      }
      if (filters.sort === "salary") query = query.order("salary_max", { ascending: false, nullsFirst: false });
      else query = query.order("created_at", { ascending: false });

      const result = await query;
      if (!result.error) return result.data;

      console.error("[Recherche Supabase] La requête moderne des offres a échoué; tentative historique.", {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
      });

      let legacyQuery = supabase
        .from("jobs")
        .select("id,title,description,sector,job_title,location,country,company_name,contract,created_at,status,salary_min,salary_max,experience,required_degree,remote,recruiter_id")
        .eq("status", "published");
      if (filters.country) legacyQuery = legacyQuery.eq("country", filters.country);
      if (filters.location) legacyQuery = legacyQuery.ilike("location", `%${filters.location}%`);
      if (filters.sector) legacyQuery = legacyQuery.eq("sector", filters.sector);
      if (filters.job_title) legacyQuery = legacyQuery.ilike("job_title", `%${filters.job_title}%`);
      if (filters.contract) legacyQuery = legacyQuery.eq("contract", filters.contract);
      if (filters.experience) legacyQuery = legacyQuery.eq("experience", filters.experience);
      if (filters.degree) legacyQuery = legacyQuery.ilike("required_degree", `%${filters.degree}%`);
      if (filters.remote !== undefined) legacyQuery = legacyQuery.eq("remote", filters.remote);
      if (filters.min_salary !== undefined) legacyQuery = legacyQuery.gte("salary_max", filters.min_salary);
      if (filters.max_salary !== undefined) legacyQuery = legacyQuery.lte("salary_min", filters.max_salary);
      if (filters.max_days !== undefined) {
        legacyQuery = legacyQuery.gte("created_at", new Date(Date.now() - filters.max_days * 86_400_000).toISOString());
      }
      if (safeQuery) {
        legacyQuery = legacyQuery.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,job_title.ilike.%${safeQuery}%`,
        );
      }
      legacyQuery = filters.sort === "salary"
        ? legacyQuery.order("salary_max", { ascending: false, nullsFirst: false })
        : legacyQuery.order("created_at", { ascending: false });
      const legacy = await legacyQuery;
      if (legacy.error) {
        console.error("[Recherche Supabase] Les offres historiques sont indisponibles.", {
          code: legacy.error.code,
          message: legacy.error.message,
          details: legacy.error.details,
          hint: legacy.error.hint,
        });
        return [];
      }
      return legacy.data.map(normalizeLegacyJob);
    },
    staleTime: 15_000,
  });
