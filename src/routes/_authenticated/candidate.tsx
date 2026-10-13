// @ts-nocheck -- temporary: schema migration in progress
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Bell, BriefcaseBusiness, Clock3, LogOut, Search, Trash2, UserPen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/site/PageShell";
import { ResumeUpload } from "@/components/site/ResumeUpload";
import { SectorJobSelect } from "@/components/site/SectorJobSelect";
import { candidateActivityOptions, candidateOptions } from "@/lib/candidate-queries";
import { catalogOptions } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/mock";

export const Route = createFileRoute("/_authenticated/candidate")({
  head: () => pageMeta("Espace candidat", "Votre profil candidat et votre CV privé.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (error || !data?.some((row) => row.role === "candidate")) throw redirect({ to: "/login" });
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(candidateOptions(context.user.id)),
      context.queryClient.ensureQueryData(candidateActivityOptions(context.user.id)),
      context.queryClient.ensureQueryData(catalogOptions),
    ]);
  },
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger votre espace. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Espace introuvable.</p>,
  component: CandidatePage,
});

function CandidatePage() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(candidateOptions(user.id));
  const { data: activity } = useSuspenseQuery(candidateActivityOptions(user.id));
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const qc = useQueryClient(); const navigate = useNavigate();
  const [sector, setSector] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };
  const createAlert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const { error } = await supabase.from("candidate_alerts").insert({
      candidate_id: user.id,
      name: String(values.get("name") || "Alerte emploi").trim(),
      sector,
      job_title: jobTitle,
      country: String(values.get("country") || ""),
      city: String(values.get("city") || "").trim(),
    });
    if (error) { toast.error("Impossible d'enregistrer cette alerte."); return; }
    form.reset(); setSector(""); setJobTitle("");
    await qc.invalidateQueries({ queryKey: ["candidate-activity", user.id] });
    toast.success("Alerte créée. Vous serez averti des nouvelles offres correspondantes.");
  };
  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from("candidate_alerts").delete().eq("id", id).eq("candidate_id", user.id);
    if (error) toast.error("Impossible de supprimer cette alerte.");
    else await qc.invalidateQueries({ queryKey: ["candidate-activity", user.id] });
  };
  const deleteAccount = async () => {
    if (!window.confirm("Supprimer définitivement votre compte et vos données personnelles ? Cette action est irréversible.")) return;
    const { error } = await supabase.rpc("delete_my_account");
    if (error) { toast.error("La suppression du compte a échoué."); return; }
    await supabase.auth.signOut(); qc.clear(); navigate({ to: "/", replace: true });
  };

  useEffect(() => {
    const channel = supabase.channel(`candidate-updates-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "applications", filter: `candidate_id=eq.${user.id}` }, (payload) => {
        const status = String((payload.new as { status?: string }).status || "");
        const labels: Record<string, string> = { viewed: "vue", reviewed: "examinée", shortlisted: "présélectionnée", interview: "entretien planifié", accepted: "acceptée", rejected: "refusée" };
        if (labels[status]) toast.info(`Votre candidature a été ${labels[status]}.`);
        void qc.invalidateQueries({ queryKey: ["candidate-activity", user.id] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs" }, (payload) => {
        const job = payload.new as { title?: string; sector?: string; job_title?: string; country?: string; location?: string };
        const matches = activity.alerts.some((alert) => alert.active
          && (!alert.sector || alert.sector === job.sector)
          && (!alert.job_title || alert.job_title === job.job_title)
          && (!alert.country || alert.country === job.country)
          && (!alert.city || alert.city.toLowerCase() === job.location?.toLowerCase()));
        if (matches) toast.info(`Nouvelle offre correspondant à vos alertes : ${job.title || "à découvrir"}`);
        void qc.invalidateQueries({ queryKey: ["public-catalog"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [activity.alerts, qc, user.id]);

  const statusLabel: Record<string, string> = { pending: "En attente", viewed: "Vue", reviewed: "Examinée", shortlisted: "Présélectionnée", interview: "Entretien", accepted: "Acceptée", rejected: "Refusée" };
  return <PageShell><div className="mx-auto max-w-4xl px-4 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-accent">Espace candidat</p><h1 className="mt-2 text-3xl font-bold text-primary">Bonjour {data.name.split(" ")[0]}</h1></div><Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button></div>
    <div className="my-8 flex flex-wrap gap-3"><Button asChild variant="accent" size="lg"><Link to="/profile"><UserPen />Compléter mon profil</Link></Button><Button asChild variant="outline" size="lg"><Link to="/jobs"><Search />Explorer les offres</Link></Button></div>
    {data.candidate?.headline && <p className="mb-6 text-muted-foreground">{data.candidate.headline} · {data.candidate.location}</p>}
    <ResumeUpload userId={user.id} resumePath={data.candidate?.resume_path} />
    <section className="border-b py-8">
      <div className="flex items-center gap-3"><BriefcaseBusiness className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Mes candidatures</h2></div>
      {activity.applications.length ? <ul className="mt-4 divide-y rounded-lg border bg-card">
        {activity.applications.map((application) => <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><Link to="/jobs/$id" params={{ id: application.job_id }} className="font-semibold hover:underline">{application.job?.title ?? "Offre supprimée"}</Link><p className="text-sm text-muted-foreground">{application.job?.company_name} · {application.job?.location}</p></div>
          <span className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"><Clock3 className="size-4" />{statusLabel[application.status] ?? application.status}</span>
        </li>)}
      </ul> : <p className="mt-3 text-sm text-muted-foreground">Vos candidatures envoyées apparaîtront ici avec leur statut.</p>}
    </section>
    <section className="border-b py-8">
      <div className="flex items-center gap-3"><Bell className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Alertes emploi</h2></div>
      <form onSubmit={createAlert} className="mt-5 grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Nom de l'alerte<Input name="name" maxLength={100} defaultValue="Nouvelles offres" required /></label>
        <label className="space-y-2 text-sm font-semibold">Pays<select name="country" className="h-12 w-full rounded-md border bg-card px-3"><option value="">Tous les pays</option>{countries.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Ville<Input name="city" maxLength={120} placeholder="Toutes les villes" /></label>
        <div className="sm:col-span-2"><SectorJobSelect sector={sector} jobTitle={jobTitle} onSectorChange={setSector} onJobTitleChange={setJobTitle} /></div>
        <Button type="submit" variant="accent" className="sm:col-span-2"><Bell />Créer une alerte</Button>
      </form>
      {activity.alerts.length > 0 && <ul className="mt-4 divide-y rounded-lg border">{activity.alerts.map((alert) => <li key={alert.id} className="flex items-center justify-between gap-3 p-4 text-sm">
        <span>{alert.name} · {[catalog.sectors.find((item) => item.slug === alert.sector)?.name, alert.job_title, alert.city, alert.country].filter(Boolean).join(" · ") || "Tous critères"}</span>
        <Button variant="ghost" size="icon" aria-label={`Supprimer l'alerte ${alert.name}`} onClick={() => deleteAlert(alert.id)}><Trash2 /></Button>
      </li>)}</ul>}
    </section>
    <section className="pt-8">
      <h2 className="text-xl font-bold text-primary">Données personnelles</h2>
      <p className="mt-2 text-sm text-muted-foreground">La suppression efface votre compte, votre profil, vos candidatures et vos CV.</p>
      <Button variant="destructive" className="mt-4" onClick={deleteAccount}><Trash2 />Supprimer mon compte</Button>
    </section>
  </div></PageShell>;
}
