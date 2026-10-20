import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Clock, MapPin, School } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { JobCard } from "@/components/site/JobCard";
import { institutions, jobs, programs } from "@/data/mock";

export const Route = createFileRoute("/institutions")({
  head: () => ({ meta: [
    { title: "Formations et institutions — Samba Job Connect" },
    { name: "description", content: "Formations professionnelles, écoles partenaires et stages au Sénégal." },
    { property: "og:title", content: "Formations et institutions — Samba Job Connect" },
    { property: "og:description", content: "Développez vos compétences avec nos institutions partenaires." },
  ] }),
  component: InstitutionsPage,
});

function InstitutionsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Développer les compétences</h1>
          <p className="mt-2 text-muted-foreground">Formations, institutions partenaires et stages pour les talents de demain.</p>
          <Button asChild variant="accent" className="mt-5"><Link to="/post-job"><School />Publier une formation</Link></Button>
        </div>
        <section>
          <h2 className="text-xl font-bold text-primary">Formations populaires</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p) => (
              <article key={p.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.institution}</p>
                <ul className="mt-3 flex-1 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-1.5"><MapPin className="size-4 text-accent" />{p.location}</li>
                  <li className="flex items-center gap-1.5"><Clock className="size-4 text-accent" />{p.duration}</li>
                  <li className="flex items-center gap-1.5"><Award className="size-4 text-accent" />{p.certification}</li>
                </ul>
                <Button variant="outline" className="mt-4" onClick={() => toast.info("Fiche détaillée bientôt disponible")}>Voir la formation</Button>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary">Institutions partenaires</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {institutions.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border bg-card p-5">
                <School className="size-8 shrink-0 text-accent" />
                <div><h3 className="font-semibold">{i.name}</h3><p className="text-sm text-muted-foreground">{i.type} · {i.location}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary">Opportunités de stage</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter((j) => j.contract === "Stage" || j.contract === "Alternance").map((j) => <JobCard key={j.id} job={j} />)}
          </div>
          <Button asChild variant="accent" className="mt-6"><Link to="/register" search={{ role: "institution" }}>Inscrire mon institution</Link></Button>
        </section>
      </div>
    </PageShell>
  );
}
