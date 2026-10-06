import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, GraduationCap, Loader2, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthLayout, Field } from "@/components/site/AuthLayout";
import { supabase } from "@/integrations/supabase/client";

// Public roles only — "admin" is assigned server-side.
const roles = [
  { value: "candidate", label: "Candidat", icon: User },
  { value: "recruiter", label: "Entreprise / Recruteur", icon: Building2 },
  { value: "institution", label: "Institution de formation", icon: GraduationCap },
] as const;
type Role = (typeof roles)[number]["value"];
const destination = { candidate: "/candidate", recruiter: "/recruiter", institution: "/institutions" } as const;

const fields = {
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "100 caractères maximum"),
  email: z.string().trim().email("Format d'email invalide").max(255),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(72, "72 caractères maximum"),
};
type Key = keyof typeof fields;
const schema = z.object(fields);

export const Route = createFileRoute("/register")({
  validateSearch: z.object({ role: z.enum(["candidate", "recruiter", "institution"]).optional() }),
  head: () => ({ meta: [
    { title: "Créer un compte — Samba Job Connect" }, { name: "description", content: "Inscrivez-vous comme candidat, recruteur ou institution de formation." },
    { property: "og:title", content: "Créer un compte — Samba Job Connect" }, { property: "og:description", content: "Rejoignez la plateforme de recrutement africaine." },
  ] }),
  component: Register,
});

function Register() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(search.role ?? "candidate");
  const [values, setValues] = useState<Record<Key, string>>({ fullName: "", email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const errorFor = (k: Key) => {
    if (!touched[k]) return undefined;
    const r = fields[k].safeParse(values[k]);
    return r.success ? undefined : r.error.issues[0]?.message;
  };
  const bind = (k: Key) => ({
    value: values[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setValues((v) => ({ ...v, [k]: e.target.value })); setTouched((t) => ({ ...t, [k]: true })); },
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    error: errorFor(k),
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true });
    const r = schema.safeParse(values);
    if (!r.success) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: r.data.email,
      password: r.data.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: r.data.fullName, role } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already registered") ? "Un compte existe déjà avec cet email." : error.message.toLowerCase().includes("pwned") || error.message.toLowerCase().includes("weak") ? "Ce mot de passe est trop faible ou compromis, choisissez-en un autre." : "Impossible de créer le compte. Réessayez.");
      return;
    }
    if (!data.session) { toast.success("Compte créé ! Vérifiez votre email pour confirmer."); return; }
    toast.success("Compte créé avec succès !");
    navigate({ to: destination[role] });
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Gratuit pour les candidats.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Je suis :</legend>
          <div className="grid gap-2">
            {roles.map((r) => (
              <label key={r.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 focus-within:ring-2 focus-within:ring-ring ${role === r.value ? "border-accent bg-accent-soft" : ""}`}>
                <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="sr-only" />
                <r.icon className={`size-5 ${role === r.value ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="fullName" label="Nom complet" autoComplete="name" {...bind("fullName")} />
        <Field id="email" label="Email" type="email" autoComplete="email" {...bind("email")} />
        <Field id="password" label="Mot de passe" type="password" autoComplete="new-password" {...bind("password")} />
        {!errorFor("password") && <p className="-mt-2 text-xs text-muted-foreground">{values.password.length}/8 caractères minimum</p>}
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}Créer mon compte
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Déjà inscrit ? <Link to="/login" className="font-semibold text-accent hover:underline">Se connecter</Link></p>
    </AuthLayout>
  );
}
