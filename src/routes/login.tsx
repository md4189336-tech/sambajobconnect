import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthLayout, Field } from "@/components/site/AuthLayout";

const schema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(255),
  password: z.string().min(6, "6 caractères minimum"),
});

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Se connecter — Samba Job Connect" }, { name: "description", content: "Connectez-vous à votre espace Samba Job Connect." },
    { property: "og:title", content: "Se connecter — Samba Job Connect" }, { property: "og:description", content: "Accédez à votre espace candidat, recruteur ou institution." },
  ] }),
  component: Login,
});

function Login() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrors({});
    toast.info("La connexion sera activée à la prochaine étape.");
  };
  return (
    <AuthLayout title="Se connecter" subtitle="Heureux de vous revoir.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field id="email" label="Email" type="email" autoComplete="email" error={errors["email"]} />
        <Field id="password" label="Mot de passe" type="password" autoComplete="current-password" error={errors["password"]} />
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">Mot de passe oublié ?</Link></div>
        <Button type="submit" variant="accent" size="lg" className="w-full">Se connecter</Button>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => toast.info("Connexion Google bientôt disponible")}>Continuer avec Google</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Pas encore de compte ? <Link to="/register" className="font-semibold text-accent hover:underline">Créer un compte</Link></p>
    </AuthLayout>
  );
}
