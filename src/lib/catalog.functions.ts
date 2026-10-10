import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!url || !key) throw new Error("Catalogue indisponible.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [sectors, titles, jobs] = await Promise.all([
    client.from("sectors").select("slug,name,description,icon,sort_order").order("sort_order"),
    client.from("job_titles").select("id,sector_slug,name,sort_order").order("sort_order"),
    client.from("jobs").select("id,title,description,sector,job_title,location,company_name,contract,created_at,status").eq("status", "published").order("created_at", { ascending: false }),
  ]);
  if (sectors.error || titles.error || jobs.error) throw new Error("Impossible de charger les secteurs et les offres.");
  return { sectors: sectors.data, titles: titles.data, jobs: jobs.data };
});