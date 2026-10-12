import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/PageShell";
import { SectorJobSelect } from "@/components/site/SectorJobSelect";
import { ResumeUpload } from "@/components/site/ResumeUpload";
import { catalogOptions } from "@/lib/catalog";
import { candidateOptions } from "@/lib/candidate-queries";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => pageMeta("Mon profil candidat", "Votre profil professionnel et votre CV sur Samba Job Connect.", true),
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (error || !data?.some((row) => row.role === "candidate")) throw redirect({ to: "/login" });
  },
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(catalogOptions), context.queryClient.ensureQueryData(candidateOptions(context.user.id))]); },
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger votre profil. Réessayez en actualisant la page.</p></PageShell>,
  notFoundComponent: () => <p>Profil introuvable.</p>,
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(candidateOptions(user.id));
  const profile = data.candidate;
  const [sector, setSector] = useState(profile?.sector || "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title || "");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setBusy(true);
    const fields = Object.fromEntries(["display_name", "headline", "location", "experience", "bio", "skills", "education", "experience_details", "professional_references"].map((key) => [key, String(form.get(key) || "").trim()]));
    try {
      const { error: profileError } = await supabase.from("profiles").update({
        full_name: String(form.get("display_name") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error } = await supabase.from("candidate_profiles").upsert({ user_id: user.id, ...fields, sector, job_title: jobTitle, is_visible: form.get("is_visible") === "on", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["candidate-profile", user.id] }); toast.success("Profil enregistré avec succès !");
    } catch { toast.error("Impossible d'enregistrer votre profil."); } finally { setBusy(false); }
  };
  return <PageShell><div className="mx-auto max-w-3xl px-4 py-10">
    <Button asChild variant="ghost"><Link to="/candidate"><ArrowLeft />Espace candidat</Link></Button>
    <h1 className="mt-5 text-3xl font-bold text-primary">Mon profil professionnel</h1>
    <form onSubmit={save} className="mt-8 space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Nom complet<Input name="display_name" defaultValue={profile?.display_name || data.name} required maxLength={150} /></label>
        <label className="space-y-2 text-sm font-semibold">Téléphone<Input name="phone" type="tel" defaultValue={data.phone} maxLength={40} autoComplete="tel" /></label>
        <label className="space-y-2 text-sm font-semibold">Titre professionnel<Input name="headline" defaultValue={profile?.headline} maxLength={200} /></label>
      </div>
      <SectorJobSelect sector={sector} jobTitle={jobTitle} onSectorChange={setSector} onJobTitleChange={setJobTitle} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Ville<Input name="location" defaultValue={profile?.location} required maxLength={120} /></label>
        <label className="space-y-2 text-sm font-semibold">Expérience<select name="experience" defaultValue={profile?.experience || "Débutant"} className="h-12 w-full rounded-md border bg-card px-3"><option>Débutant</option><option>1-3 ans</option><option>3-5 ans</option><option>5 ans +</option></select></label>
      </div>
      <label className="block space-y-2 text-sm font-semibold">Compétences<Input name="skills" defaultValue={profile?.skills} maxLength={1000} /></label>
      <label className="block space-y-2 text-sm font-semibold">Diplômes et formations<Textarea name="education" rows={4} defaultValue={profile?.education} maxLength={4000} placeholder="Un diplôme ou une formation par ligne" /></label>
      <label className="block space-y-2 text-sm font-semibold">Expériences professionnelles<Textarea name="experience_details" rows={5} defaultValue={profile?.experience_details} maxLength={6000} placeholder="Poste, entreprise, période et principales missions" /></label>
      <label className="block space-y-2 text-sm font-semibold">Références professionnelles<Textarea name="professional_references" rows={3} defaultValue={profile?.professional_references} maxLength={3000} placeholder="Nom, fonction et coordonnées, avec l'accord de la personne" /></label>
      <label className="block space-y-2 text-sm font-semibold">Présentation<Textarea name="bio" rows={5} defaultValue={profile?.bio} maxLength={4000} /></label>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="is_visible" defaultChecked={profile?.is_visible ?? true} />Profil visible par les recruteurs</label>
      <Button type="submit" variant="accent" size="lg" disabled={busy}><Save />{busy ? "Enregistrement…" : "Enregistrer mon profil"}</Button>
    </form>
    <div className="mt-10"><ResumeUpload userId={user.id} resumePath={profile?.resume_path} /></div>
  </div></PageShell>;
}