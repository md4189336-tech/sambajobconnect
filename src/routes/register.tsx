import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, GraduationCap, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthLayout, Field } from "@/components/site/AuthLayout";

// Public roles only — "admin" is assigned server-side.
const roles = [
  { value: "candidate", label: "Candidat", icon: User },
  { value: "recruiter", label: "Entreprise / Recruteur", icon: Building2 },
  { value: "institution", label: "Institution de formation", icon: GraduationCap },
] as const;
type Role = (typeof roles)[number]["value"];

const schema = z.object({
  fullName: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("Adresse email invalide").max(255),
  password: z.string().min(8, "8 caractères minimum").max(72),
});

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
  const [role, setRole] = useState<Role>(search.role ?? "candidate");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrors({});
    toast.info("L'inscription sera activée à la prochaine étape.");
  };
  return (
    <AuthLayout title="Créer un compte" subtitle="Gratuit pour les candidats.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Je suis :</legend>
          <div className="grid gap-2">
            {roles.map((r) => (
              <label key={r.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 ${role === r.value ? "border-accent bg-accent-soft" : ""}`}>
                <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="sr-only" />
                <r.icon className={`size-5 ${role === r.value ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="fullName" label={role === "candidate" ? "Nom complet" : "Nom du responsable"} autoComplete="name" error={errors.fullName} />
        <Field id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
        <Field id="password" label="Mot de passe" type="password" autoComplete="new-password" error={errors.password} />
        <Button type="submit" variant="accent" size="lg" className="w-full">Créer mon compte</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Déjà inscrit ? <Link to="/login" className="font-semibold text-accent hover:underline">Se connecter</Link></p>
    </AuthLayout>
  );
}
