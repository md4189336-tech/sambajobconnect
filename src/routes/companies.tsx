import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { CompanyLogo } from "@/components/site/JobCard";
import { companies, jobs, sectorName } from "@/data/mock";

export const Route = createFileRoute("/companies")({
  head: () => ({ meta: [
    { title: "Entreprises qui recrutent — Samba Job Connect" },
    { name: "description", content: "Découvrez les entreprises qui recrutent au Sénégal et leurs offres d'emploi." },
    { property: "og:title", content: "Entreprises qui recrutent — Samba Job Connect" },
    { property: "og:description", content: "Les entreprises partenaires de Samba Job Connect." },
  ] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <h1 className="text-3xl font-extrabold text-primary">Entreprises qui recrutent</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} to="/company/$id" params={{ id: c.id }} className="rounded-xl border bg-card p-5 shadow-card hover:border-accent">
              <div className="flex items-center gap-3">
                <CompanyLogo initials={c.initials} />
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1 font-semibold">{c.name}{c.verified && <BadgeCheck className="size-4 text-accent" aria-label="Vérifiée" />}</h2>
                  <p className="text-sm text-muted-foreground">{sectorName(c.sector)}</p>
                </div>
              </div>
              <p className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-4" />{c.location}</span>
                <span className="font-semibold text-accent">{jobs.filter((j) => j.companyId === c.id).length} offres</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  ),
});
