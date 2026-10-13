// @ts-nocheck -- temporary: schema migration in progress
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PageShell } from "@/components/site/PageShell";
import { JobSearchBar } from "@/components/site/JobSearchBar";
import { contractTypes, countries, experienceLevels, locations } from "@/data/mock";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/lib/catalog";
import { DatabaseJobCard } from "@/components/site/DatabaseJobCard";
import { publicJobsOptions } from "@/lib/job-search";

const searchSchema = z.object({
  q: z.string().optional(), location: z.string().optional(), country: z.string().optional(), sector: z.string().optional(), job_title: z.string().optional(),
  contract: z.string().optional(), experience: z.string().optional(), degree: z.string().optional(), remote: z.boolean().optional(),
  min_salary: z.preprocess((v) => v === undefined || v === "" ? undefined : Number(v), z.number().nonnegative().optional()),
  max_salary: z.preprocess((v) => v === undefined || v === "" ? undefined : Number(v), z.number().nonnegative().optional()),
  max_days: z.preprocess((v) => v === undefined || v === "" ? undefined : Number(v), z.number().nonnegative().optional()),
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

function JobsPage() {
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const sectors = catalog.sectors;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  const [sort, setSort] = useState("recent");
  const selectedSectorId = sectors.find((sector) => sector.slug === search.sector)?.id;
  const { data: queriedJobs = [], isPending: jobsPending } = useQuery(publicJobsOptions(
    { ...search, sort },
    selectedSectorId && /^[0-9a-f-]{36}$/i.test(selectedSectorId) ? selectedSectorId : undefined,
  ));
  const setSearch = (key: keyof typeof search, value: string | number | boolean | undefined) =>
    navigate({ search: (previous) => ({ ...previous, [key]: value === "" ? undefined : value }) });

  const databaseResults = queriedJobs;
  const total = databaseResults.length;

  const panel = (
    <div className="space-y-6">
      <FilterGroup label="Pays">
        <select value={search.country ?? ""} onChange={(e) => setSearch("country", e.target.value)} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Pays">
          <option value="">Tous les pays</option>{countries.map((country) => <option key={country}>{country}</option>)}
        </select>
      </FilterGroup>
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
        <input value={search.location ?? ""} onChange={(e) => setSearch("location", e.target.value)} placeholder="Ville" className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Ville" list="job-cities" />
        <datalist id="job-cities">{locations.map((city) => <option key={city} value={city} />)}</datalist>
      </FilterGroup>
      <FilterGroup label="Type de contrat">
        <select value={search.contract ?? ""} onChange={(e) => setSearch("contract", e.target.value)} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Type de contrat">
          <option value="">Tous les contrats</option>{contractTypes.map((contract) => <option key={contract}>{contract}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Expérience">
        <select value={search.experience ?? ""} onChange={(e) => setSearch("experience", e.target.value)} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Niveau d'expérience">
          <option value="">Tous les niveaux</option>{experienceLevels.map((level) => <option key={level}>{level}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Salaire mensuel (FCFA)">
        <select value={search.min_salary ?? ""} onChange={(e) => setSearch("min_salary", e.target.value ? Number(e.target.value) : undefined)} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Salaire minimum">
          <option value="">Sans minimum</option><option value={200000}>200 000 +</option><option value={400000}>400 000 +</option><option value={600000}>600 000 +</option>
        </select>
        <select value={search.max_salary ?? ""} onChange={(e) => setSearch("max_salary", e.target.value ? Number(e.target.value) : undefined)} className="mt-2 h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Salaire maximum">
          <option value="">Sans maximum</option><option value={300000}>300 000 max</option><option value={500000}>500 000 max</option><option value={800000}>800 000 max</option>
        </select>
      </FilterGroup>
      <FilterGroup label="Diplôme requis"><input value={search.degree ?? ""} onChange={(e) => setSearch("degree", e.target.value)} placeholder="Ex. Bac+3" className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Diplôme requis" /></FilterGroup>
      <FilterGroup label="Date de publication">
        <select value={search.max_days ?? ""} onChange={(e) => setSearch("max_days", e.target.value ? Number(e.target.value) : undefined)} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Date de publication">
          <option value="">Toutes les dates</option><option value={1}>Dernières 24h</option><option value={7}>7 derniers jours</option><option value={30}>30 derniers jours</option>
        </select>
      </FilterGroup>
      <FilterGroup label="Télétravail"><select value={search.remote === undefined ? "" : String(search.remote)} onChange={(e) => setSearch("remote", e.target.value === "" ? undefined : e.target.value === "true")} className="h-11 w-full rounded-md border bg-card px-3 text-sm" aria-label="Télétravail"><option value="">Indifférent</option><option value="true">Oui</option><option value="false">Non</option></select></FilterGroup>
      <Button variant="outline" className="w-full" onClick={() => navigate({ search: {} })}>Réinitialiser</Button>
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
            <p className="text-sm font-semibold" aria-live="polite">{jobsPending ? "Recherche des offres…" : `${total} offre${total > 1 ? "s" : ""} trouvée${total > 1 ? "s" : ""}`}</p>
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
          {jobsPending ? <p role="status" className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">Chargement des offres correspondant à vos filtres…</p> : total ? (
            <div className="grid gap-4 md:grid-cols-2">{databaseResults.map((j) => <DatabaseJobCard key={j.id} job={{
              id: j.id,
              title: j.title,
              company_name: j.company_name,
              location: j.city || j.location,
              contract: j.contract_type || j.contract,
              job_title: j.job_title,
              company_id: j.company_id,
              recruiter_id: j.recruiter_id,
            }} verified={(j.company_id !== null && catalog.verifiedCompanyIds.includes(j.company_id)) || catalog.verifiedCompanyOwners.includes(j.recruiter_id)} />)}</div>
          ) : (
            <div className="rounded-xl border bg-card p-10 text-center">
              <SearchX className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Aucune offre ne correspond à votre recherche.</p>
              <p className="text-sm text-muted-foreground">Essayez d'élargir vos filtres.</p>
              <Button variant="accent" className="mt-4" onClick={() => navigate({ search: {} })}>Voir toutes les offres</Button>
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
