import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthLayout, Field } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "Mot de passe oublié — Samba Job Connect" }, { name: "description", content: "Réinitialisez votre mot de passe Samba Job Connect." },
    { property: "og:title", content: "Mot de passe oublié — Samba Job Connect" }, { property: "og:description", content: "Recevez un lien de réinitialisation." },
  ] }),
  component: Forgot,
});

function Forgot() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = z.string().trim().email().safeParse(new FormData(e.currentTarget).get("email"));
    if (!r.success) return setError("Adresse email invalide");
    setError(undefined); setSent(true);
  };
  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Nous vous enverrons un lien de réinitialisation.">
      {sent ? <p role="status" className="rounded-lg bg-accent-soft p-4 text-sm text-accent">Si un compte existe pour cette adresse, un email vous sera envoyé une fois la connexion activée.</p> : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field id="email" label="Email" type="email" autoComplete="email" error={error} />
          <Button type="submit" variant="accent" size="lg" className="w-full">Envoyer le lien</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-accent hover:underline">Retour à la connexion</Link></p>
    </AuthLayout>
  );
}
