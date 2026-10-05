import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Globe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { CompanyLogo, JobCard } from "@/components/site/JobCard";
import { getCompany, jobs, sectorName } from "@/data/mock";

export const Route = createFileRoute("/company/$id")({
  loader: ({ params }) => {
    const company = getCompany(params.id);
    if (!company) throw notFound();
    return { company };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Entreprise introuvable" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.company.name} — Offres d'emploi | Samba Job Connect`;
    return { meta: [{ title: t }, { name: "description", content: loaderData.company.description }, { property: "og:title", content: t }, { property: "og:description", content: loaderData.company.description }] };
  },
  notFoundComponent: () => <PageShell><div className="py-24 text-center"><h1 className="text-2xl font-bold">Entreprise introuvable</h1><Button asChild variant="accent" className="mt-6"><Link to="/companies">Voir les entreprises</Link></Button></div></PageShell>,
  errorComponent: () => <PageShell><p className="py-24 text-center">Impossible de charger cette entreprise.</p></PageShell>,
  component: CompanyPage,
});

function CompanyPage() {
  const { company: c } = Route.useLoaderData();
  const open = jobs.filter((j) => j.companyId === c.id);
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <header className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <CompanyLogo initials={c.initials} size="lg" />
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-primary">{c.name}</h1>
              <p className="text-muted-foreground">{sectorName(c.sector)}</p>
              {c.verified && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent"><BadgeCheck className="size-3.5" />Entreprise vérifiée</span>}
            </div>
          </div>
          <ul className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-1"><MapPin className="size-4" />{c.location}</li>
            <li className="flex items-center gap-1"><Users className="size-4" />{c.size}</li>
            <li className="flex items-center gap-1"><Globe className="size-4" />{c.website}</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed">{c.description}</p>
        </header>
        <h2 className="mb-4 mt-8 text-xl font-bold text-primary">Offres disponibles ({open.length})</h2>
        {open.length ? <div className="grid gap-4 md:grid-cols-2">{open.map((j) => <JobCard key={j.id} job={j} />)}</div>
          : <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Aucune offre pour le moment.</p>}
      </div>
    </PageShell>
  );
}
