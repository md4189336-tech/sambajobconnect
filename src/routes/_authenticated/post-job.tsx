import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/post-job")({
  head: () => pageMeta("Publier une offre", "Publiez une offre d'emploi avec son secteur et son métier.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (error || !data?.some((row) => row.role === "recruiter" || row.role === "company" || row.role === "admin")) throw redirect({ to: "/login" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger le formulaire. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Formulaire introuvable.</p>,
  component: PostJobPage,
});

function PostJobPage() {
  const { user } = Route.useRouteContext();
  const { data: catalog } = useSuspenseQuery(catalogOptions);
  const qc = useQueryClient();
  const [sector, setSector] = useState(""); const [jobTitle, setJobTitle] = useState("");
  const [busy, setBusy] = useState(false); const [created, setCreated] = useState<string>();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (!catalog.titles.some((t) => t.sector_slug === sector && t.name === jobTitle)) { toast.error("Choisissez un secteur et un métier valides."); return; }
    const title = String(form.get("title") || "").trim(); const description = String(form.get("description") || "").trim();
    if (title.length < 3 || description.length < 30) { toast.error("Le titre doit contenir au moins 3 caractères et la description 30 caractères."); return; }
    const salaryMin = form.get("salary_min") ? Number(form.get("salary_min")) : null;
    const salaryMax = form.get("salary_max") ? Number(form.get("salary_max")) : null;
    if ((salaryMin !== null && salaryMin < 0) || (salaryMax !== null && salaryMax < 0) || (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax)) {
      toast.error("Vérifiez la fourchette de salaire : les montants doivent être positifs et le maximum supérieur au minimum."); return;
    }
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
        salary_range: salaryMin !== null && salaryMax !== null
          ? `${salaryMin}-${salaryMax}`
          : salaryMin !== null ? `${salaryMin}+` : salaryMax !== null ? `0-${salaryMax}` : null,
        experience: String(form.get("experience") || ""),
        experience_level: String(form.get("experience") || ""),
        required_degree: String(form.get("required_degree") || "").trim(),
        education_level: String(form.get("required_degree") || "").trim(),
        remote: form.get("remote") === "on",
        is_remote: form.get("remote") === "on",
        status: "published",
      }).select("id").single();
      let createdJob = modern.data;
      if (modern.error && ["PGRST204", "42703"].includes(modern.error.code ?? "")) {
        console.warn("[Publication offre] Schéma récent indisponible, repli sur les colonnes historiques.", modern.error);
        const legacy = await supabase.from("jobs").insert({
          recruiter_id: user.id,
          title,
          description,
          sector,
          job_title: jobTitle,
          location: String(form.get("location") || "").trim(),
          country: String(form.get("country") || "Sénégal"),
          company_name: String(form.get("company_name") || "").trim(),
          contract: String(form.get("contract")),
          salary_min: salaryMin,
          salary_max: salaryMax,
          experience: String(form.get("experience") || ""),
          required_degree: String(form.get("required_degree") || "").trim(),
          remote: form.get("remote") === "on",
          status: "published",
        }).select("id").single();
        if (legacy.error) throw legacy.error;
        createdJob = legacy.data;
      } else if (modern.error) {
        throw modern.error;
      }
      if (!createdJob) throw new Error("Supabase n'a retourné aucun identifiant d'offre.");
      await qc.invalidateQueries({ queryKey: ["public-catalog"] });
      await qc.invalidateQueries({ queryKey: ["public-jobs"] });
      setCreated(createdJob.id);
      toast.success("Offre publiée avec succès !");
    } catch (error) {
      console.error("[Publication offre] Échec :", error);
      toast.error(error instanceof Error ? `Impossible de publier l'offre : ${error.message}` : "Impossible de publier l'offre. Réessayez.");
    } finally { setBusy(false); }
  };
  return <PageShell><div className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold text-primary">Publier une offre</h1>
    {created ? <div role="status" className="mt-8 space-y-5"><h2 className="text-xl font-semibold">Votre offre est publiée.</h2><Button asChild variant="accent"><Link to="/jobs/$id" params={{ id: created }}>Voir mon offre</Link></Button><Button variant="outline" onClick={() => setCreated(undefined)}>Publier une autre offre</Button></div> :
    <form onSubmit={submit} className="mt-8 space-y-6">
      <label className="block space-y-2 text-sm font-semibold">Titre du poste<Input name="title" required minLength={3} maxLength={200} /></label>
      <label className="block space-y-2 text-sm font-semibold">Entreprise<Input name="company_name" required maxLength={200} /></label>
      <SectorJobSelect sector={sector} jobTitle={jobTitle} onSectorChange={setSector} onJobTitleChange={setJobTitle} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Pays<select name="country" defaultValue="Sénégal" className="h-12 w-full rounded-md border bg-card px-3">{countries.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Ville<Input name="location" required maxLength={120} /></label>
        <label className="space-y-2 text-sm font-semibold">Type de contrat<select name="contract" className="h-12 w-full rounded-md border bg-card px-3">{["CDI", "CDD", "Stage", "Freelance", "Alternance", "Mission"].map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Expérience requise<select name="experience" className="h-12 w-full rounded-md border bg-card px-3"><option value="">Indifférente</option>{experienceLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Salaire minimum (FCFA / mois)<Input name="salary_min" type="number" min={0} step={10000} /></label>
        <label className="space-y-2 text-sm font-semibold">Salaire maximum (FCFA / mois)<Input name="salary_max" type="number" min={0} step={10000} /></label>
        <label className="space-y-2 text-sm font-semibold sm:col-span-2">Diplôme requis<Input name="required_degree" maxLength={200} placeholder="Ex. BTS, Bac+3 ou équivalent" /></label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input name="remote" type="checkbox" className="size-4 accent-[var(--accent)]" />Télétravail possible</label>
      <label className="block space-y-2 text-sm font-semibold">Description du poste<Textarea name="description" rows={8} required minLength={30} maxLength={15000} /></label>
      <Button type="submit" variant="accent" size="lg" disabled={busy}><Send />{busy ? "Publication…" : "Publier l'offre"}</Button>
    </form>}
  </div></PageShell>;
}