import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Building2, BriefcaseBusiness, CalendarClock, Check, LogOut, Plus, ShieldCheck, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";
import { pageMeta } from "@/lib/page-meta";
import { recruiterOptions } from "@/lib/recruiter-queries";
import { catalogOptions } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => pageMeta("Espace entreprise", "Gérez votre entreprise, vos offres et vos recrutements.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (error || !data?.some((row) => row.role === "recruiter" || row.role === "company")) throw redirect({ to: "/login" });
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(recruiterOptions(context.user.id)),
      context.queryClient.ensureQueryData(catalogOptions),
    ]);
  },
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger votre espace entreprise. Actualisez la page.</p></PageShell>,
  component: RecruiterPage,
});

function RecruiterPage() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(recruiterOptions(user.id));
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [candidateQuery, setCandidateQuery] = useState("");
  const [candidateSector, setCandidateSector] = useState("");

  useEffect(() => {
    const channel = supabase.channel(`recruiter-applications-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "applications" }, () => {
        void qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
        toast.info("Nouvelle candidature reçue.");
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc, user.id]);

  useEffect(() => {
    const pendingIds = data.applications.filter((application) => application.status === "pending").map((application) => application.id);
    if (!pendingIds.length) return;
    void supabase.from("applications").update({ status: "viewed", updated_at: new Date().toISOString() }).in("id", pendingIds)
      .then(({ error }) => { if (!error) void qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] }); });
  }, [data.applications, qc, user.id]);

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const saveCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const companyFields = {
      name: String(values.get("company_name") || "").trim(),
      description: String(values.get("description") || "").trim(),
      website: String(values.get("website") || "").trim() || null,
      country: String(values.get("country") || "Sénégal").trim(),
      city: String(values.get("city") || "").trim(),
      sector_id: String(values.get("sector_id") || "") || null,
    };
    const newCompany = await supabase.from("companies").upsert({
      owner_id: user.id,
      ...companyFields,
    }, { onConflict: "owner_id" });
    if (newCompany.error) {
      console.error("[Espace entreprise] Échec de l'enregistrement dans companies :", newCompany.error);
    }
    const { error } = await supabase.from("company_profiles").upsert({
      user_id: user.id,
      company_name: companyFields.name,
      registration_number: String(values.get("registration_number") || "").trim(),
      website: companyFields.website ?? "",
      country: companyFields.country,
      city: companyFields.city,
      description: companyFields.description,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error || newCompany.error) { toast.error("Impossible d'enregistrer le profil de l'entreprise. Vérifiez les migrations Supabase et les autorisations."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    toast.success("Profil entreprise enregistré.");
  };

  const requestVerification = async () => {
    const { error } = await supabase.rpc("request_company_verification");
    if (error) { toast.error("Complétez le nom légal et le numéro d'immatriculation avant de soumettre le dossier."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    toast.success("Dossier transmis à l'équipe de vérification.");
  };

  const closeJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId).eq("recruiter_id", user.id);
    if (error) { toast.error("Impossible de clôturer ce recrutement."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    await qc.invalidateQueries({ queryKey: ["public-catalog"] });
    toast.success("Recrutement clôturé.");
  };

  const updateApplication = async (applicationId: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status, updated_at: new Date().toISOString() }).eq("id", applicationId);
    if (error) { toast.error("Impossible de mettre à jour la candidature."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    toast.success("Statut de candidature mis à jour.");
  };

  const scheduleInterview = async (applicationId: string, value: string) => {
    if (!value) return;
    const { error } = await supabase.from("applications").update({ status: "interview", interview_at: new Date(value).toISOString(), updated_at: new Date().toISOString() }).eq("id", applicationId);
    if (error) { toast.error("Impossible d'enregistrer l'entretien."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    toast.success("Entretien planifié.");
  };

  const openResume = async (path: string) => {
    const { data: signed, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error) { toast.error("CV indisponible ou accès non autorisé."); return; }
    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  };

  const toggleShortlist = async (candidateId: string) => {
    const shortlisted = data.shortlists.some((entry) => entry.candidate_id === candidateId);
    const result = shortlisted
      ? await supabase.from("candidate_shortlists").delete().eq("recruiter_id", user.id).eq("candidate_id", candidateId)
      : await supabase.from("candidate_shortlists").insert({ recruiter_id: user.id, candidate_id: candidateId });
    if (result.error) { toast.error("Impossible de mettre à jour la présélection."); return; }
    await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
    toast.success(shortlisted ? "Profil retiré de la présélection." : "Profil ajouté à la présélection.");
  };

  const statusLabel: Record<string, string> = { pending: "En attente", viewed: "Vue", reviewed: "Examinée", shortlisted: "Présélectionnée", interview: "Entretien", accepted: "Acceptée", rejected: "Refusée" };
  const verificationLabel: Record<string, string> = { unverified: "Non vérifiée", pending: "Vérification en cours", verified: "Entreprise vérifiée", rejected: "Dossier à corriger" };

  return <PageShell><div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-semibold text-accent">Espace entreprise</p><h1 className="mt-2 text-3xl font-bold text-primary">Gérez vos recrutements</h1></div>
      <div className="flex gap-2"><Button asChild variant="accent"><Link to="/post-job"><Plus />Publier une offre</Link></Button><Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button></div>
    </div>

    <section className="mt-8 border-y py-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Building2 className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Profil de l'entreprise</h2></div>
        <span className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"><ShieldCheck className="size-4 text-accent" />{verificationLabel[data.company?.verification_status ?? "unverified"]}</span>
      </div>
      <form onSubmit={saveCompany} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Nom légal de l'entreprise<Input name="company_name" required maxLength={200} defaultValue={data.company?.company_name} /></label>
        <label className="space-y-2 text-sm font-semibold">N° d'immatriculation<Input name="registration_number" required maxLength={120} defaultValue={data.company?.registration_number} /></label>
        <label className="space-y-2 text-sm font-semibold">Site web<Input name="website" type="url" maxLength={255} defaultValue={data.company?.website} placeholder="https://" /></label>
        <label className="space-y-2 text-sm font-semibold">Pays<Input name="country" maxLength={100} defaultValue={data.company?.country || "Sénégal"} /></label>
        <label className="space-y-2 text-sm font-semibold">Ville<Input name="city" maxLength={120} defaultValue={data.company?.city} /></label>
        <label className="space-y-2 text-sm font-semibold">Secteur d'activité<select name="sector_id" defaultValue={catalog.sectors.find((sector) => sector.slug === data.company?.sector_id)?.id ?? ""} className="h-12 w-full rounded-md border bg-card px-3"><option value="">Choisir un secteur</option>{catalog.sectors.map((sector) => <option key={sector.slug} value={sector.id}>{sector.name}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold sm:col-span-2">Présentation<Textarea name="description" rows={4} maxLength={4000} defaultValue={data.company?.description} /></label>
        <Button type="submit" variant="outline" className="sm:col-span-2"><Building2 />Enregistrer le profil</Button>
      </form>
      {data.company?.verification_note && <p className="mt-3 text-sm text-destructive">Note de vérification : {data.company.verification_note}</p>}
      <Button variant="accent" className="mt-4" onClick={requestVerification} disabled={data.company?.verification_status === "pending" || data.company?.verification_status === "verified"}>
        <BadgeCheck />{data.company?.verification_status === "pending" ? "Dossier en cours d'examen" : data.company?.verification_status === "verified" ? "Entreprise vérifiée" : "Soumettre pour vérification"}
      </Button>
    </section>

    <section className="border-b py-8">
      <div className="flex items-center gap-3"><BriefcaseBusiness className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Mes offres · {data.jobs.length}</h2></div>
      {data.jobs.length ? <ul className="mt-4 divide-y rounded-lg border bg-card">{data.jobs.map((job) => {
        const applicants = data.applications.filter((application) => application.job_id === job.id).length;
        const published = job.status === "published";
        return <li key={job.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div><Link to="/jobs/$id" params={{ id: job.id }} className="font-semibold hover:underline">{job.title}</Link><p className="text-sm text-muted-foreground">{job.job_title} · {job.location}, {job.country} · {applicants} candidature{applicants === 1 ? "" : "s"}</p></div>
          <div className="flex items-center gap-2"><span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">{published ? "Publiée" : "Clôturée"}</span>{published && <Button size="sm" variant="outline" onClick={() => closeJob(job.id)}><X />Clôturer</Button>}</div>
        </li>;
      })}</ul> : <p className="mt-3 text-sm text-muted-foreground">Aucune offre publiée. Créez votre première annonce.</p>}
    </section>

    <section className="border-b py-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><UserRound className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Profils candidats visibles · {data.candidates.length}</h2></div>
        <div className="flex flex-wrap gap-2"><Input aria-label="Rechercher un candidat" value={candidateQuery} onChange={(event) => setCandidateQuery(event.target.value)} placeholder="Nom, métier, compétence…" className="w-56" />
          <select aria-label="Filtrer les candidats par secteur" value={candidateSector} onChange={(event) => setCandidateSector(event.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm"><option value="">Tous les secteurs</option>{[...new Set(data.candidates.map((candidate) => candidate.sector).filter(Boolean))].sort().map((sector) => <option key={sector}>{sector}</option>)}</select>
        </div>
      </div>
      {(() => {
        const query = candidateQuery.trim().toLowerCase();
        const filtered = data.candidates.filter((candidate) => (!candidateSector || candidate.sector === candidateSector)
          && (!query || `${candidate.display_name} ${candidate.headline} ${candidate.job_title} ${candidate.skills} ${candidate.location}`.toLowerCase().includes(query)));
        return filtered.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2">{filtered.map((candidate) => {
          const shortlisted = data.shortlists.some((entry) => entry.candidate_id === candidate.user_id);
          return <li key={candidate.user_id} className="rounded-lg border bg-card p-5">
            <h3 className="font-bold">{candidate.display_name || "Candidat"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{candidate.headline} · {candidate.location}</p>
            <p className="mt-2 text-sm">{candidate.job_title} · {candidate.experience}</p>
            {candidate.skills && <p className="mt-2 text-sm text-muted-foreground">Compétences : {candidate.skills}</p>}
            {candidate.education && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">Formation : {candidate.education}</p>}
            {candidate.experience_details && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">Expérience : {candidate.experience_details}</p>}
            <div className="mt-4 flex flex-wrap gap-2">{candidate.resume_path && <Button size="sm" variant="outline" onClick={() => openResume(candidate.resume_path!)}><BadgeCheck />Consulter le CV</Button>}
              <Button size="sm" variant={shortlisted ? "outline" : "accent"} onClick={() => toggleShortlist(candidate.user_id)}>{shortlisted ? <X /> : <Check />}{shortlisted ? "Retirer de la présélection" : "Présélectionner"}</Button>
            </div>
          </li>;
        })}</ul> : <p className="mt-4 text-sm text-muted-foreground">Aucun profil visible ne correspond à ces critères.</p>;
      })()}
    </section>

    <section className="py-8">
      <div className="flex items-center gap-3"><UserRound className="size-6 text-accent" /><h2 className="text-xl font-bold text-primary">Candidats · {data.applications.length}</h2></div>
      {data.applications.length ? <div className="mt-4 space-y-4">{data.applications.map((application) => <article key={application.id} className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0"><h3 className="font-bold">{application.candidate?.display_name || "Candidat"}</h3><p className="text-sm text-muted-foreground">{application.candidate?.headline} · {application.candidate?.location}</p><p className="mt-1 text-sm">Candidature pour <Link to="/jobs/$id" params={{ id: application.job_id }} className="font-medium text-accent hover:underline">{application.job?.title}</Link></p>
            {application.candidate?.skills && <p className="mt-2 text-sm text-muted-foreground">Compétences : {application.candidate.skills}</p>}
            {application.cover_letter && <p className="mt-3 whitespace-pre-wrap text-sm">{application.cover_letter}</p>}
          </div>
          {application.candidate?.resume_path && <Button variant="outline" size="sm" onClick={() => openResume(application.candidate!.resume_path!)}><BadgeCheck />Consulter le CV</Button>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
          <label className="text-sm font-medium">Statut<select value={application.status} onChange={(event) => updateApplication(application.id, event.target.value)} className="ml-2 h-10 rounded-md border bg-card px-3" aria-label={`Statut de ${application.candidate?.display_name || "la candidature"}`}>
            {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          {application.status === "interview" && <label className="flex items-center gap-2 text-sm"><CalendarClock className="size-4" />Entretien<input type="datetime-local" value={application.interview_at ? new Date(application.interview_at).toISOString().slice(0, 16) : ""} onChange={(event) => scheduleInterview(application.id, event.target.value)} className="h-10 rounded-md border bg-card px-3" /></label>}
          {application.status !== "accepted" && application.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => updateApplication(application.id, "shortlisted")}><Check />Présélectionner</Button>}
        </div>
      </article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Les candidatures reçues apparaîtront ici.</p>}
    </section>
  </div></PageShell>;
}