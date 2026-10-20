// @ts-nocheck -- temporary: schema migration in progress
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { GraduationCap, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";
import { SectorJobSelect } from "@/components/site/SectorJobSelect";
import { catalogOptions } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";
import { countries, experienceLevels } from "@/data/mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/post-job")({
  head: () => pageMeta("Publier une offre", "Publiez une offre d'emploi avec son secteur et son métier.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    const roles = data?.map((row) => row.role) ?? [];
    if (error || !roles.some((role) => ["recruiter", "company", "institution", "admin"].includes(role))) throw redirect({ to: "/login" });
    return { roles };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger le formulaire. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Formulaire introuvable.</p>,
  component: PostJobPage,
});

function PostJobPage() {
  const { user, roles } = Route.useRouteContext();
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const qc = useQueryClient();
  const [sector, setSector] = useState(""); const [jobTitle, setJobTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const canPublishJobs = roles.some((role) => ["recruiter", "company", "admin"].includes(role));
  const canPublishTrainings = roles.some((role) => role === "institution" || role === "admin");
  const { data: trainings = [], isLoading: trainingsLoading, error: trainingsError } = useQuery({
    queryKey: ["institution-trainings", user.id],
    enabled: canPublishTrainings,
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("id,title,institution_name,location,duration,award,opening_date,closing_date,status").eq("institution_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const publishJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (!catalog.titles.some((t) => t.sector_slug === sector && t.name === jobTitle)) { toast.error("Choisissez un secteur et un métier valides."); return; }
    const title = String(form.get("title") || "").trim(); const description = String(form.get("description") || "").trim();
    if (title.length < 3 || description.length < 30) { toast.error("Le titre doit contenir au moins 3 caractères et la description 30 caractères."); return; }
    const salaryMin = Number(form.get("salary_min"));
    const salaryMax = Number(form.get("salary_max"));
    const openingDate = String(form.get("opening_date") || "");
    const closingDate = String(form.get("closing_date") || "");
    if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin < 0 || salaryMax < salaryMin) {
      toast.error("Vérifiez la fourchette salariale : les montants doivent être positifs et le maximum supérieur au minimum."); return;
    }
    if (!openingDate || !closingDate || closingDate < openingDate) {
      toast.error("La date de clôture doit être postérieure ou égale à la date d'ouverture."); return;
    }
    setFeedback("");
    setBusy(true);
    try {
      const company = await supabase.from("companies").select("id").eq("owner_id", user.id).maybeSingle();
      if (company.error) {
        console.error("[Publication offre] Impossible de trouver le profil companies :", company.error);
      }
      const sectorId = catalog.sectors.find((item) => item.slug === sector)?.id;
      const modern = await supabase.from("jobs").insert({
        recruiter_id: user.id,
        title,
        description,
        company_id: company.data?.id ?? null,
        sector_id: sectorId && /^[0-9a-f-]{36}$/i.test(sectorId) ? sectorId : null,
        sector,
        job_title: jobTitle,
        location: String(form.get("location") || "").trim(),
        city: String(form.get("location") || "").trim(),
        country: String(form.get("country") || "Sénégal"),
        company_name: String(form.get("company_name") || "").trim(),
        contract: String(form.get("contract")),
        contract_type: String(form.get("contract")),
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_range: `${salaryMin}-${salaryMax}`,
        experience: String(form.get("experience") || ""),
        experience_level: String(form.get("experience") || ""),
        required_degree: String(form.get("required_degree") || "").trim(),
        education_level: String(form.get("required_degree") || "").trim(),
        remote: form.get("remote") === "on",
        is_remote: form.get("remote") === "on",
        opening_date: openingDate,
        closing_date: closingDate,
        status: "published",
      }).select("id").single();
      if (modern.error) throw modern.error;
      if (!modern.data) throw new Error("Supabase n'a retourné aucun identifiant d'offre.");
      await qc.invalidateQueries({ queryKey: ["public-catalog"] });
      await qc.invalidateQueries({ queryKey: ["public-jobs"] });
      await qc.invalidateQueries({ queryKey: ["recruiter-workspace", user.id] });
      setFeedback("L'offre est publiée et visible dans le catalogue.");
      formElement.reset();
      setSector(""); setJobTitle("");
      toast.success("Offre publiée avec succès !");
    } catch (error) {
      console.error("[Publication offre] Échec :", error);
      setFeedback("La publication a échoué. Vérifiez les informations et réessayez.");
      toast.error(error instanceof Error ? `Impossible de publier l'offre : ${error.message}` : "Impossible de publier l'offre. Réessayez.");
    } finally { setBusy(false); }
  };
  const publishTraining = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const openingDate = String(form.get("training_opening_date") || "");
    const closingDate = String(form.get("training_closing_date") || "");
    const description = String(form.get("training_description") || "").trim();
    if (description.length < 30) { toast.error("La description doit contenir au moins 30 caractères."); return; }
    if (!openingDate || !closingDate || closingDate < openingDate) { toast.error("La date de fermeture doit être postérieure ou égale à la date d'ouverture."); return; }
    setFeedback(""); setBusy(true);
    try {
      const { error } = await supabase.from("trainings").insert({
        institution_id: user.id,
        title: String(form.get("training_title") || "").trim(),
        institution_name: String(form.get("institution_name") || "").trim(),
        location: String(form.get("training_location") || "").trim(),
        duration: String(form.get("duration") || "").trim(),
        award: String(form.get("award") || "").trim(),
        opening_date: openingDate,
        closing_date: closingDate,
        description,
        status: "published",
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["institution-trainings", user.id] });
      await qc.invalidateQueries({ queryKey: ["public-trainings"] });
      setFeedback("La formation est publiée."); formElement.reset();
      toast.success("Formation publiée avec succès !");
    } catch (error) {
      console.error("[Publication formation] Échec :", error);
      setFeedback("La publication a échoué. Vérifiez les informations et réessayez.");
      toast.error("Impossible de publier la formation. Vérifiez les migrations Supabase et réessayez.");
    } finally { setBusy(false); }
  };

  const closeTraining = async (trainingId: string) => {
    const { error } = await supabase.from("trainings").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", trainingId).eq("institution_id", user.id);
    if (error) { toast.error("Impossible de clôturer cette formation."); return; }
    await qc.invalidateQueries({ queryKey: ["institution-trainings", user.id] });
    await qc.invalidateQueries({ queryKey: ["public-trainings"] });
    toast.success("Formation clôturée.");
  };

  return <PageShell><div className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-3xl font-bold text-primary">Publier une opportunité</h1>
    <Tabs defaultValue={canPublishJobs ? "job" : "training"} className="mt-7">
      <TabsList className="h-auto flex-wrap">
        {canPublishJobs && <TabsTrigger value="job">Publier une offre d'emploi</TabsTrigger>}
        {canPublishTrainings && <TabsTrigger value="training">Publier une formation</TabsTrigger>}
      </TabsList>
      {canPublishJobs && <TabsContent value="job">
        <form onSubmit={publishJob} className="mt-5 space-y-6">
          <label className="block space-y-2 text-sm font-semibold">Intitulé du poste<Input name="title" required minLength={3} maxLength={200} /></label>
          <label className="block space-y-2 text-sm font-semibold">Entreprise<Input name="company_name" required maxLength={200} /></label>
          <SectorJobSelect sector={sector} jobTitle={jobTitle} onSectorChange={setSector} onJobTitleChange={setJobTitle} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">Pays<select name="country" defaultValue="Sénégal" className="h-12 w-full rounded-md border bg-card px-3">{countries.map((country) => <option key={country}>{country}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold">Ville<Input name="location" required maxLength={120} /></label>
            <label className="space-y-2 text-sm font-semibold">Type de contrat<select name="contract" required className="h-12 w-full rounded-md border bg-card px-3">{["CDI", "CDD", "Stage", "Alternance", "Freelance"].map((contract) => <option key={contract}>{contract}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold">Expérience requise<select name="experience" className="h-12 w-full rounded-md border bg-card px-3"><option value="">Indifférente</option>{experienceLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold">Salaire minimum (FCFA / mois)<Input name="salary_min" type="number" required min={0} step={10000} /></label>
            <label className="space-y-2 text-sm font-semibold">Salaire maximum (FCFA / mois)<Input name="salary_max" type="number" required min={0} step={10000} /></label>
            <label className="space-y-2 text-sm font-semibold">Date d'ouverture<Input name="opening_date" type="date" required /></label>
            <label className="space-y-2 text-sm font-semibold">Date de clôture<Input name="closing_date" type="date" required /></label>
            <label className="space-y-2 text-sm font-semibold sm:col-span-2">Diplôme requis<Input name="required_degree" maxLength={200} placeholder="Ex. BTS, Bac+3 ou équivalent" /></label>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input name="remote" type="checkbox" className="size-4 accent-[var(--accent)]" />Télétravail possible</label>
          <label className="block space-y-2 text-sm font-semibold">Description détaillée<Textarea name="description" rows={8} required minLength={30} maxLength={15000} /></label>
          {feedback && <p role="status" aria-live="polite" className="text-sm text-accent">{feedback}</p>}
          <Button type="submit" variant="accent" size="lg" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Send />}{busy ? "Publication…" : "Publier l'offre"}</Button>
        </form>
      </TabsContent>}
      {canPublishTrainings && <TabsContent value="training">
        <form onSubmit={publishTraining} className="mt-5 space-y-6">
          <label className="block space-y-2 text-sm font-semibold">Intitulé de la formation<Input name="training_title" required minLength={3} maxLength={200} /></label>
          <label className="block space-y-2 text-sm font-semibold">Nom de l'institution / école<Input name="institution_name" required maxLength={200} /></label>
          <label className="block space-y-2 text-sm font-semibold">Ville / localisation<Input name="training_location" required maxLength={200} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">Durée<Input name="duration" required maxLength={120} placeholder="Ex. 6 mois" /></label>
            <label className="space-y-2 text-sm font-semibold">Type de diplôme / sanction<Input name="award" required maxLength={160} placeholder="Certification, BTS…" /></label>
            <label className="space-y-2 text-sm font-semibold">Date d'ouverture<Input name="training_opening_date" type="date" required /></label>
            <label className="space-y-2 text-sm font-semibold">Date de fermeture<Input name="training_closing_date" type="date" required /></label>
          </div>
          <label className="block space-y-2 text-sm font-semibold">Description détaillée<Textarea name="training_description" rows={7} required minLength={30} maxLength={15000} /></label>
          {feedback && <p role="status" aria-live="polite" className="text-sm text-accent">{feedback}</p>}
          <Button type="submit" variant="accent" size="lg" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <GraduationCap />}{busy ? "Publication…" : "Publier la formation"}</Button>
        </form>
        <section className="mt-10 border-t pt-7">
          <h2 className="text-xl font-bold text-primary">Mes formations · {trainings.length}</h2>
          {trainingsLoading ? <p role="status" className="mt-3 text-sm text-muted-foreground">Chargement des formations…</p>
            : trainingsError ? <p role="alert" className="mt-3 text-sm text-destructive">Impossible de charger vos formations.</p>
              : trainings.length ? <ul className="mt-4 divide-y rounded-lg border">{trainings.map((training) => <li key={training.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div><h3 className="font-semibold">{training.title}</h3><p className="text-sm text-muted-foreground">{training.institution_name} · {training.location} · {training.duration} · {training.award}</p><p className="text-xs text-muted-foreground">Du {training.opening_date} au {training.closing_date} · {training.status === "published" ? "Publiée" : "Clôturée"}</p></div>
                {training.status === "published" && <Button size="sm" variant="outline" onClick={() => closeTraining(training.id)}><X />Clôturer</Button>}
              </li>)}</ul>
                : <p className="mt-3 text-sm text-muted-foreground">Aucune formation publiée pour le moment.</p>}
        </section>
      </TabsContent>}
    </Tabs>
  </div></PageShell>;
}