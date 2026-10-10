import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Sprout, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "À propos — Samba Job Connect" },
    { name: "description", content: "Notre mission : connecter les compétences et les opportunités au Sénégal et en Afrique." },
    { property: "og:title", content: "À propos — Samba Job Connect" },
    { property: "og:description", content: "Les compétences rencontrent les opportunités." },
  ] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-primary">Les compétences rencontrent les opportunités.</h1>
        <p className="mt-4 text-muted-foreground">Samba Job Connect est une plateforme de recrutement née au Sénégal, qui relie candidats, entreprises et institutions de formation, avec l'ambition de servir toute l'Afrique.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[{ i: ShieldCheck, t: "Confiance", d: "Entreprises vérifiées et offres modérées." }, { i: Handshake, t: "Accessibilité", d: "Pensé pour le mobile et les connexions limitées." }, { i: Sprout, t: "Croissance", d: "Former et placer les talents de demain." }].map((v) => (
            <div key={v.t} className="rounded-xl border bg-card p-5"><v.i className="size-6 text-accent" /><h2 className="mt-3 font-semibold">{v.t}</h2><p className="text-sm text-muted-foreground">{v.d}</p></div>
          ))}
        </div>
        <h2 className="mt-10 text-xl font-bold text-primary">Contact</h2>
        <p className="mt-2 text-sm text-muted-foreground"><a href="tel:+221773806886">+221 77 380 68 86</a> / <a href="tel:+242065707472">+242 06 570 74 72</a></p>
        <a className="mt-2 block break-all text-sm text-accent" href="mailto:managementaziz221@gmail.com">managementaziz221@gmail.com</a>
      </div>
    </PageShell>
  ),
});
