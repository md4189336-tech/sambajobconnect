import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, BadgeCheck, Briefcase, Clock, Flag, GraduationCap, MapPin, Share2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";
import { CompanyLogo, JobCard } from "@/components/site/JobCard";
import { formatPosted, formatSalary, getCompany, getJob, jobs, sectorName } from "@/data/mock";

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => {
    const job = getJob(params.id);
    if (!job) throw notFound();
    return { job, company: getCompany(job.companyId)! };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Offre introuvable — Samba Job Connect" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.job.title} — ${loaderData.company.name} | Samba Job Connect`;
    const d = `${loaderData.job.contract} à ${loaderData.job.location}. ${formatSalary(loaderData.job.salaryMin, loaderData.job.salaryMax)}. Postulez sur Samba Job Connect.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  notFoundComponent: () => (
    <PageShell><div className="mx-auto max-w-md py-24 text-center"><h1 className="text-2xl font-bold">Offre introuvable</h1>
      <Button asChild variant="accent" className="mt-6"><Link to="/jobs">Explorer les offres</Link></Button></div></PageShell>
  ),
  errorComponent: () => <PageShell><p className="py-24 text-center">Impossible de charger cette offre.</p></PageShell>,
  component: JobDetail,
});

function JobDetail() {
  const { job, company } = Route.useLoaderData();
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [cover, setCover] = useState("");

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: job.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Lien copié"); }
  };

  const facts = [
    { icon: MapPin, label: job.location }, { icon: Briefcase, label: job.contract },
    { icon: Wallet, label: formatSalary(job.salaryMin, job.salaryMax) }, { icon: GraduationCap, label: job.experience },
    { icon: Clock, label: formatPosted(job.postedDaysAgo) },
  ];

  return (
    <PageShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-28 lg:grid-cols-[1fr_340px] lg:px-8 lg:pb-12">
        <article className="space-y-6">
          <header className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <CompanyLogo initials={company.initials} size="lg" />
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">{job.title}</h1>
                <Link to="/company/$id" params={{ id: company.id }} className="mt-1 inline-flex items-center gap-1 font-medium text-muted-foreground hover:underline">
                  {company.name}{company.verified && <BadgeCheck className="size-4 text-accent" aria-label="Entreprise vérifiée" />}
                </Link>
              </div>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {facts.map((f) => <li key={f.label} className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm"><f.icon className="size-4 text-accent" />{f.label}</li>)}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="accent" size="lg" className="hidden lg:inline-flex" onClick={() => setApplyOpen(true)}>Postuler maintenant</Button>
              <Button variant="outline" onClick={() => { setSaved(!saved); toast.success(saved ? "Offre retirée des favoris" : "Offre enregistrée"); }} aria-pressed={saved}>
                <Bookmark className={saved ? "fill-current" : ""} />{saved ? "Enregistrée" : "Enregistrer l'offre"}
              </Button>
              <Button variant="outline" onClick={share}><Share2 />Partager</Button>
              <Button variant="ghost" onClick={() => setReportOpen(true)}><Flag />Signaler cette offre</Button>
            </div>
          </header>
          <Section title="Description du poste"><p>{job.description}</p></Section>
          <Section title="Missions"><ul className="list-disc space-y-1 pl-5">{job.missions.map((m) => <li key={m}>{m}</li>)}</ul></Section>
          <Section title="Profil recherché"><ul className="list-disc space-y-1 pl-5">{job.profile.map((m) => <li key={m}>{m}</li>)}</ul></Section>
          <Section title="Compétences"><ul className="flex flex-wrap gap-2">{job.skills.map((s) => <li key={s} className="rounded-md bg-accent-soft px-3 py-1 text-sm font-medium text-accent">{s}</li>)}</ul></Section>
          <Section title="Avantages"><ul className="list-disc space-y-1 pl-5">{job.benefits.map((m) => <li key={m}>{m}</li>)}</ul></Section>
        </article>
        <aside className="space-y-4">
          <div id="postuler" className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="font-semibold">À propos de {company.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{sectorName(company.sector)} · {company.size}</p>
            <p className="mt-3 text-sm text-muted-foreground">{company.description}</p>
            <Button asChild variant="outline" className="mt-4 w-full"><Link to="/company/$id" params={{ id: company.id }}>Voir l'entreprise</Link></Button>
          </div>
          <h2 className="pt-2 font-semibold">Offres similaires</h2>
          {jobs.filter((j) => j.id !== job.id && j.sector === job.sector).slice(0, 2).map((j) => <JobCard key={j.id} job={j} />)}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card p-3 lg:hidden">
        <Button variant="accent" size="lg" className="w-full" onClick={() => setApplyOpen(true)}>Postuler maintenant</Button>
      </div>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postuler : {job.title}</DialogTitle>
            <DialogDescription>{company.name} · {job.location}</DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium" htmlFor="cover">Lettre de motivation (facultatif)</label>
          <Textarea id="cover" rows={5} maxLength={1500} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Présentez-vous en quelques lignes..." />
          <p className="text-xs text-muted-foreground">Connectez-vous pour joindre votre CV et suivre votre candidature.</p>
          <DialogFooter className="gap-2">
            <Button asChild variant="outline"><Link to="/login">Se connecter</Link></Button>
            <Button variant="accent" onClick={() => { setApplyOpen(false); setCover(""); toast.success("Candidature envoyée (démonstration)"); }}>Envoyer ma candidature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Signaler cette offre</DialogTitle><DialogDescription>Aidez-nous à garder la plateforme fiable.</DialogDescription></DialogHeader>
          <select className="h-11 rounded-md border bg-card px-3 text-sm" aria-label="Motif">
            <option>Offre frauduleuse ou arnaque</option><option>Informations trompeuses</option><option>Contenu inapproprié</option><option>Offre expirée</option>
          </select>
          <DialogFooter><Button variant="destructive" onClick={() => { setReportOpen(false); toast.success("Signalement envoyé à la modération"); }}>Envoyer le signalement</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border bg-card p-6"><h2 className="mb-3 text-lg font-bold text-primary">{title}</h2><div className="text-sm leading-relaxed text-foreground/85">{children}</div></section>;
}
