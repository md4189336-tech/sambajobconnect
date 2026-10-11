import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, FileUp, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { JobSearchBar } from "@/components/site/JobSearchBar";
import { JobCard } from "@/components/site/JobCard";
import { jobs, platformStats } from "@/data/mock";
import { sectors as sectorIcons } from "@/data/sectors";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/lib/catalog";
import { DatabaseJobCard } from "@/components/site/DatabaseJobCard";

const title = "Samba Job Connect — Trouvez votre emploi au Sénégal et en Afrique";
const description = "Trouvez des emplois, stages et opportunités professionnelles au Sénégal et en Afrique avec Samba Job Connect.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger les opportunités. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Page introuvable.</p>,
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  return (
    <PageShell>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center md:py-24">
          <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            Trouver un emploi. Trouver les bons talents. Développer les compétences.
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Trouvez votre prochaine opportunité professionnelle
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
            Des opportunités d'emploi, de stages et de formations pour les talents au Sénégal et en Afrique.
          </p>
          <div className="mt-8 text-left"><JobSearchBar /></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground"><span className="font-bold text-accent">1 250+</span> offres disponibles</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label="Statistiques">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
              <p className="text-2xl font-extrabold text-primary sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <h2 className="text-2xl font-bold text-primary">Explorez les opportunités par secteur</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.sectors.map((s) => {
            const Icon = sectorIcons.find((icon) => icon.slug === s.slug)?.icon ?? Building2;
            return (
            <Link key={s.slug} to="/jobs" search={{ sector: s.slug }}
              className="group flex min-h-36 flex-col justify-between rounded-lg border bg-card p-4 transition-colors hover:border-accent">
              <Icon className="size-7 text-accent" aria-hidden />
              <span className="mt-3 text-sm font-semibold group-hover:text-accent">{s.name}</span>
              <span className="mt-2 text-xs text-muted-foreground">{catalog.titles.filter((t) => t.sector_slug === s.slug).length} métiers</span>
            </Link>
          ); })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary">Dernières opportunités</h2>
          <Link to="/jobs" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">Toutes les offres <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalog.jobs.slice(0, 6).map((j) => <DatabaseJobCard key={j.id} job={j} />)}
          {jobs.slice(0, Math.max(0, 6 - catalog.jobs.length)).map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-2xl font-bold text-primary">Votre prochaine opportunité commence ici.</h2>
          <p className="mt-3 text-muted-foreground">Créez votre profil professionnel, ajoutez votre CV et postulez rapidement aux offres qui correspondent à vos compétences.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="accent" size="lg"><Link to="/register" search={{ role: "candidate" }}><UserPlus />Créer mon profil</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/register" search={{ role: "candidate" }}><FileUp />Importer mon CV</Link></Button>
          </div>
        </div>
        <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
          <h2 className="text-2xl font-bold">Trouvez les talents dont votre entreprise a besoin.</h2>
          <p className="mt-3 text-primary-foreground/75">Publiez vos offres, gérez vos candidatures et trouvez rapidement les meilleurs profils.</p>
          <Button asChild variant="accent" size="lg" className="mt-6"><Link to="/register" search={{ role: "recruiter" }}><Building2 />Publier une offre</Link></Button>
        </div>
      </section>
    </PageShell>
  );
}
