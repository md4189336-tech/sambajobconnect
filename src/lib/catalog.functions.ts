// @ts-nocheck -- temporary: schema migration in progress
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { sectors as localSectors } from "@/data/sectors";
import type { Database } from "@/integrations/supabase/types";

function reportCatalogError(area: string, error: { code?: string; message: string; details?: string; hint?: string }) {
  console.error(`[Catalogue Supabase] ${area}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
}

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_ANON_KEY"];
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const localCatalog = {
    sectors: localSectors.map(({ slug, name, description }, index) => ({
      id: slug,
      slug,
      name,
      description,
      icon: "",
      sort_order: index + 1,
    })),
    titles: localSectors.flatMap((sector) =>
      sector.jobTitles.map((name, index) => ({
        id: `${sector.slug}-${index + 1}`,
        sector_slug: sector.slug,
        name,
        sort_order: index + 1,
      })),
    ),
  };

  if (!url || !key) {
    console.error("[Catalogue Supabase] Variables SUPABASE_URL et clé publique manquantes.");
    return {
      ...localCatalog,
      jobs: [],
      verifiedCompanyIds: [] as string[],
      verifiedCompanyOwners: [] as string[],
    };
  }

  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization")?.startsWith("Bearer sb_")) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const [sectorResult, titleResult, newJobResult, companyResult] = await Promise.all([
    client.from("sectors").select("id,slug,name,description,icon,sort_order").order("sort_order"),
    client.from("job_titles").select("id,sector_slug,name,sort_order").order("sort_order"),
    client
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    client.from("companies").select("id,owner_id,is_verified"),
  ]);

  if (sectorResult.error) reportCatalogError("Lecture des secteurs (taxonomie locale utilisée)", sectorResult.error);
  if (titleResult.error) reportCatalogError("Lecture des métiers (taxonomie locale utilisée)", titleResult.error);

  let jobs: Database["public"]["Tables"]["jobs"]["Row"][] = [];
  if (!newJobResult.error) {
    jobs = newJobResult.data;
  } else {
    reportCatalogError("Lecture des offres récentes (essai de compatibilité historique)", newJobResult.error);
    const legacy = await client
      .from("jobs")
      .select("id,title,description,sector,job_title,location,country,company_name,contract,created_at,status,salary_min,salary_max,experience,required_degree,remote,recruiter_id")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (legacy.error) {
      reportCatalogError("Lecture des offres historiques (aucune offre affichée)", legacy.error);
    } else {
      jobs = legacy.data.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        sector: job.sector,
        sector_id: null,
        job_title: job.job_title,
        location: job.location,
        city: job.location,
        country: job.country,
        company_name: job.company_name,
        company_id: null,
        contract: job.contract,
        contract_type: job.contract,
        created_at: job.created_at,
        status: job.status,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_range: null,
        experience: job.experience,
        experience_level: job.experience,
        required_degree: job.required_degree,
        education_level: job.required_degree,
        remote: job.remote,
        is_remote: job.remote,
        is_featured: false,
        recruiter_id: job.recruiter_id,
      }));
    }
  }

  let verifiedCompanyIds: string[] = [];
  let verifiedCompanyOwners: string[] = [];
  if (!companyResult.error) {
    verifiedCompanyIds = companyResult.data.filter((company) => company.is_verified).map((company) => company.id);
    verifiedCompanyOwners = companyResult.data.filter((company) => company.is_verified).map((company) => company.owner_id);
  } else {
    reportCatalogError("Lecture des entreprises (essai de compatibilité historique)", companyResult.error);
    const legacyCompanies = await client
      .from("company_profiles")
      .select("user_id")
      .eq("verification_status", "verified");
    if (legacyCompanies.error) {
      reportCatalogError("Lecture des entreprises vérifiées", legacyCompanies.error);
    } else {
      verifiedCompanyOwners = legacyCompanies.data.map((company) => company.user_id);
    }
  }

  return {
    sectors: sectorResult.error ? localCatalog.sectors : sectorResult.data,
    titles: titleResult.error ? localCatalog.titles : titleResult.data,
    jobs,
    verifiedCompanyIds,
    verifiedCompanyOwners,
  };
});
