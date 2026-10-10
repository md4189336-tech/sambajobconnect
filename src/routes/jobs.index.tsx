import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PageShell } from "@/components/site/PageShell";
import { JobSearchBar } from "@/components/site/JobSearchBar";
import { JobCard } from "@/components/site/JobCard";
import { contractTypes, experienceLevels, getCompany, jobs, locations } from "@/data/mock";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/lib/catalog";
import { DatabaseJobCard } from "@/components/site/DatabaseJobCard";

const searchSchema = z.object({
  q: z.string().optional(), location: z.string().optional(), sector: z.string().optional(), job_title: z.string().optional(),
});

export const Route = createFileRoute("/jobs/")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger les offres. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Offres introuvables.</p>,
  head: () => ({
    meta: [
      { title: "Offres d'emploi au Sénégal — Samba Job Connect" },
      { name: "description", content: "Parcourez les offres d'emploi, stages et missions à Dakar, Thiès, Kolda, Ziguinchor et partout au Sénégal." },
      { property: "og:title", content: "Offres d'emploi au Sénégal — Samba Job Connect" },
      { property: "og:description", content: "CDI, CDD, stages et freelance : trouvez l'offre qui vous correspond." },
    ],
  }),
  component: JobsPage,
});

type Filters = { contracts: string[]; experience: string[]; remote: boolean; minSalary: number; maxDays: number };
const emptyFilters: Filters = { contracts: [], experience: [], remote: false, minSalary: 0, maxDays: 0 };
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

function JobsPage() {
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const sectors = catalog.sectors;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState("recent");

  const results = useMemo(() => {
    const list = jobs.filter((j) => {
      const c = getCompany(j.companyId);
      if (!c) return false;
      if (search.q && !norm(`${j.title} ${c.name} ${j.skills.join(" ")}`).includes(norm(search.q))) return false;
      if (search.location && !norm(j.location).includes(norm(search.location))) return false;
      if (search.sector && j.sector !== search.sector) return false;
      if (search.job_title && j.jobTitle !== search.job_title) return false;
      if (filters.contracts.length && !filters.contracts.includes(j.contract)) return false;
      if (filters.experience.length && !filters.experience.includes(j.experience)) return false;
      if (filters.remote && !j.remote) return false;
      if (filters.minSalary && j.salaryMax < filters.minSalary) return false;
      if (filters.maxDays && j.postedDaysAgo > filters.maxDays) return false;
      return true;
    });
    if (sort === "salary") return [...list].sort((a, b) => b.salaryMax - a.salaryMax);
    if (sort === "recent") return [...list].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    return list;
  }, [search, filters, sort]);

  const databaseResults = catalog.jobs.filter((j) => {
    if (search.q && !norm(`${j.title} ${j.company_name} ${j.description} ${j.job_title}`).includes(norm(search.q))) return false;
    if (search.location && !norm(j.location).includes(norm(search.location))) return false;
    if (search.sector && j.sector !== search.sector) return false;
    if (search.job_title && j.job_title !== search.job_title) return false;
    if (filters.contracts.length && !filters.contracts.includes(j.contract)) return false;
    if (filters.experience.length || filters.remote || filters.minSalary) return false;
    if (filters.maxDays && (Date.now() - Date.parse(j.created_at)) / 86400000 > filters.maxDays) return false;
    return true;
  });
  const total = results.length + databaseResults.length;

  const toggle = (key: "contracts" | "experience", v: string) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));

  const panel = (
    <div className="space-y-6">
      <FilterGroup label="Secteur">
        <select value={search.sector ?? ""} onChange={(e) => navigate({ search: (p) => ({ ...p, sector: e.target.value || undefined, job_title: undefined }) })}
          className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Secteur">
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Métier">
        <select value={search.job_title ?? ""} disabled={!search.sector} onChange={(e) => navigate({ search: (p) => ({ ...p, job_title: e.target.value || undefined }) })} className="h-11 w-full rounded-md border bg-card px-3 text-sm disabled:opacity-60" aria-label="Métier">
          <option value="">Tous les métiers</option>
          {catalog.titles.filter((t) => t.sector_slug === search.sector).map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Localisation">
        <select value={search.location ?? ""} onChange={(e) => navigate({ search: (p) => ({ ...p, location: e.target.value || undefined }) })}
          className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Localisation">
          <option value="">Toutes les villes</option>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Type de contrat">
        {contractTypes.map((c) => <Check key={c} label={c} checked={filters.contracts.includes(c)} onChange={() => toggle("contracts", c)} />)}
      </FilterGroup>
      <FilterGroup label="Expérience">
        {experienceLevels.map((c) => <Check key={c} label={c} checked={filters.experience.includes(c)} onChange={() => toggle("experience", c)} />)}
      </FilterGroup>
      <FilterGroup label="Salaire minimum">
        <select value={filters.minSalary} onChange={(e) => setFilters((f) => ({ ...f, minSalary: +e.target.value }))} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Salaire minimum">
          <option value={0}>Indifférent</option><option value={200000}>200 000 FCFA +</option><option value={400000}>400 000 FCFA +</option><option value={600000}>600 000 FCFA +</option>
        </select>
      </FilterGroup>
      <FilterGroup label="Date de publication">
        <select value={filters.maxDays} onChange={(e) => setFilters((f) => ({ ...f, maxDays: +e.target.value }))} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Date de publication">
          <option value={0}>Toutes les dates</option><option value={1}>Dernières 24h</option><option value={7}>7 derniers jours</option><option value={30}>30 derniers jours</option>
        </select>
      </FilterGroup>
      <Check label="Télétravail possible" checked={filters.remote} onChange={() => setFilters((f) => ({ ...f, remote: !f.remote }))} />
      <Button variant="outline" className="w-full" onClick={() => { setFilters(emptyFilters); navigate({ search: {} }); }}>Réinitialiser</Button>
    </div>
  );

  return (
    <PageShell>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <h1 className="mb-5 text-2xl font-extrabold text-primary sm:text-3xl">Trouver un emploi</h1>
          <JobSearchBar key={JSON.stringify(search)} initial={search} />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="hidden lg:block" aria-label="Filtres">{panel}</aside>
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold" aria-live="polite">{total} offre{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal />Filtres</Button></SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
                  <SheetTitle className="mb-4">Filtres</SheetTitle>{panel}
                </SheetContent>
              </Sheet>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-md border bg-card px-3 text-sm" aria-label="Trier par">
                <option value="recent">Plus récentes</option><option value="relevance">Pertinence</option><option value="salary">Salaire le plus élevé</option>
              </select>
            </div>
          </div>
          {total ? (
            <div className="grid gap-4 md:grid-cols-2">{databaseResults.map((j) => <DatabaseJobCard key={j.id} job={j} />)}{results.map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <div className="rounded-xl border bg-card p-10 text-center">
              <SearchX className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Aucune offre ne correspond à votre recherche.</p>
              <p className="text-sm text-muted-foreground">Essayez d'élargir vos filtres.</p>
              <Button variant="accent" className="mt-4" onClick={() => { setFilters(emptyFilters); navigate({ search: {} }); }}>Voir toutes les offres</Button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="space-y-1">{children}</div></fieldset>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[var(--accent)]" />{label}
    </label>
  );
}
