import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Bookmark, BadgeCheck, Briefcase, Clock, Flag, GraduationCap, MapPin, Share2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";
import { CompanyLogo, JobCard } from "@/components/site/JobCard";
import { formatPosted, formatSalary, getCompany, getJob, jobs, sectorName, type Job, type Company } from "@/data/mock";
import { catalogOptions } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/jobs/$id")({
  loader: async ({ params, context }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogOptions);
    const databaseJob = catalog.jobs.find((j) => j.id === params.id);
    if (databaseJob) return {
      databaseJob,
      job: null,
      company: null,
      verifiedCompany:
        (databaseJob.company_id !== null && catalog.verifiedCompanyIds.includes(databaseJob.company_id)) ||
        catalog.verifiedCompanyOwners.includes(databaseJob.recruiter_id),
    };
    const job = getJob(params.id);
    if (!job) throw notFound();
    const company = getCompany(job.companyId);
    if (!company) throw notFound();
    return { job, company, databaseJob: null, verifiedCompany: false };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Offre introuvable — Samba Job Connect" }, { name: "robots", content: "noindex" }] };
    if (loaderData.databaseJob) return pageMeta(`${loaderData.databaseJob.title} · ${loaderData.databaseJob.company_name}`, `${loaderData.databaseJob.contract} à ${loaderData.databaseJob.location}. ${loaderData.databaseJob.description.slice(0, 160)}`);
    if (!loaderData.job || !loaderData.company) return pageMeta("Offre indisponible", "Cette offre n'est pas disponible.");
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
  const { job, company, databaseJob, verifiedCompany } = Route.useLoaderData();
  if (databaseJob) return <DatabaseJobDetail job={databaseJob} verified={verifiedCompany} />;
  if (!job || !company) return null;
  return <DemoJobDetail job={job} company={company} />;
}

function DatabaseJobDetail({ job, verified }: { job: { id: string; title: string; company_name: string; location: string; country: string; contract: string; job_title: string; description: string; salary_min: number | null; salary_max: number | null; experience: string; required_degree: string; remote: boolean }; verified: boolean }) {
  const navigate = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [busy, setBusy] = useState(false);
  const apply = async () => {
    setBusy(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) {
        toast.error("Connectez-vous avec un compte candidat pour postuler.");
        navigate({ to: "/login" });
        return;
      }
      const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", auth.user.id);
      if (roleError || !roles?.some((item) => item.role === "candidate")) {
        toast.error("La candidature est réservée aux comptes candidats.");
        return;
      }
      const { data: candidate, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("resume_path")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (candidateError) {
        console.error("[Candidature] Impossible de charger le CV du candidat :", candidateError);
        toast.error("Impossible de charger votre profil candidat. Réessayez.");
        return;
      }
      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        candidate_id: auth.user.id,
        cover_letter: cover.trim(),
        cv_url: candidate?.resume_path ?? null,
      });
      if (error) {
        toast.error(error.code === "23505" ? "Vous avez déjà postulé à cette offre." : "Impossible d'envoyer votre candidature.");
        return;
      }
      toast.success("Candidature envoyée. Vous pourrez suivre son statut dans votre espace candidat.");
      setApplyOpen(false); setCover("");
    } finally { setBusy(false); }
  };
  const salary = job.salary_min !== null || job.salary_max !== null
    ? `${job.salary_min?.toLocaleString("fr-FR") ?? "—"} – ${job.salary_max?.toLocaleString("fr-FR") ?? "—"} FCFA / mois`
    : "Salaire non communiqué";
  return <PageShell><article className="mx-auto max-w-4xl px-4 py-10">
    <p className="flex items-center gap-2 text-sm font-semibold text-accent">{job.company_name}{verified && <BadgeCheck className="size-4" aria-label="Entreprise vérifiée" />}</p>
    <h1 className="mt-3 text-3xl font-bold text-primary">{job.title}</h1>
    <div className="mt-5 flex flex-wrap gap-3 text-sm"><span>{job.location}, {job.country}</span><span>{job.contract}</span><span>{job.job_title}</span><span>{salary}</span>{job.experience && <span>{job.experience}</span>}{job.required_degree && <span>{job.required_degree}</span>}{job.remote && <span>Télétravail</span>}</div>
    <h2 className="mt-10 text-xl font-bold text-primary">Description du poste</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
    <div className="mt-8 flex flex-wrap gap-3"><Button variant="accent" size="lg" onClick={() => setApplyOpen(true)}>Postuler</Button><Button asChild variant="outline" size="lg"><Link to="/jobs">Toutes les offres</Link></Button></div>
    <Dialog open={applyOpen} onOpenChange={setApplyOpen}><DialogContent>
      <DialogHeader><DialogTitle>Postuler : {job.title}</DialogTitle><DialogDescription>{job.company_name} · {job.location}</DialogDescription></DialogHeader>
      <label className="text-sm font-medium" htmlFor="database-cover">Lettre de motivation (facultatif)</label>
      <Textarea id="database-cover" rows={5} maxLength={1500} value={cover} onChange={(event) => setCover(event.target.value)} placeholder="Présentez-vous en quelques lignes..." />
      <DialogFooter className="gap-2"><Button asChild variant="outline"><Link to="/register" search={{ role: "candidate" }}>Créer un compte candidat</Link></Button><Button variant="accent" onClick={apply} disabled={busy}>{busy ? "Envoi…" : "Envoyer ma candidature"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </article></PageShell>;
}

function DemoJobDetail({ job, company }: { job: Job; company: Company }) {
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

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
          <p className="text-sm text-muted-foreground">Cette annonce est un exemple et n'accepte pas de candidature. Les offres publiées dans la plateforme permettent un envoi et un suivi réels.</p>
          <DialogFooter><Button asChild variant="accent"><Link to="/jobs">Voir les offres publiées</Link></Button></DialogFooter>
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
