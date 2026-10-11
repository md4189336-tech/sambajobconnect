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

export const Route = createFileRoute("/_authenticated/post-job")({
  head: () => pageMeta("Publier une offre", "Publiez une offre d'emploi avec son secteur et son métier.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (error || !data?.some((row) => row.role === "recruiter" || row.role === "admin")) throw redirect({ to: "/login" });
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
    setBusy(true);
    try {
      const { data, error } = await supabase.from("jobs").insert({ recruiter_id: user.id, title, description, sector, job_title: jobTitle, location: String(form.get("location") || "").trim(), company_name: String(form.get("company_name") || "").trim(), contract: String(form.get("contract")), status: "published" }).select("id").single();
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["public-catalog"] }); setCreated(data.id); toast.success("Offre publiée avec succès !");
    } catch { toast.error("Impossible de publier l'offre. Réessayez."); } finally { setBusy(false); }
  };
  return <PageShell><div className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold text-primary">Publier une offre</h1>
    {created ? <div role="status" className="mt-8 space-y-5"><h2 className="text-xl font-semibold">Votre offre est publiée.</h2><Button asChild variant="accent"><Link to="/jobs/$id" params={{ id: created }}>Voir mon offre</Link></Button><Button variant="outline" onClick={() => setCreated(undefined)}>Publier une autre offre</Button></div> :
    <form onSubmit={submit} className="mt-8 space-y-6">
      <label className="block space-y-2 text-sm font-semibold">Titre du poste<Input name="title" required minLength={3} maxLength={200} /></label>
      <label className="block space-y-2 text-sm font-semibold">Entreprise<Input name="company_name" required maxLength={200} /></label>
      <SectorJobSelect sector={sector} jobTitle={jobTitle} onSectorChange={setSector} onJobTitleChange={setJobTitle} required />
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-semibold">Ville<Input name="location" required maxLength={120} /></label><label className="space-y-2 text-sm font-semibold">Type de contrat<select name="contract" className="h-12 w-full rounded-md border bg-card px-3">{["CDI", "CDD", "Stage", "Freelance", "Alternance", "Mission"].map((c) => <option key={c}>{c}</option>)}</select></label></div>
      <label className="block space-y-2 text-sm font-semibold">Description du poste<Textarea name="description" rows={8} required minLength={30} maxLength={15000} /></label>
      <Button type="submit" variant="accent" size="lg" disabled={busy}><Send />{busy ? "Publication…" : "Publier l'offre"}</Button>
    </form>}
  </div></PageShell>;
}