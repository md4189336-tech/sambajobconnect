import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";

const plans = [
  { name: "Starter", tagline: "Pour les petites entreprises.", price: "1 offre", features: ["1 offre", "Gestion des candidatures", "Tableau de bord"], cta: "Commencer" },
  { name: "Business", tagline: "Abonnement mensuel", price: "Mensuel", features: ["Offres multiples", "ATS", "Statistiques", "Gestion avancée des candidatures"], cta: "Choisir Business", popular: true },
  { name: "Premium", tagline: "Accès CVthèque", price: "CVthèque", features: ["Recherche avancée", "Accès aux profils", "Filtres avancés", "Contact candidats", "Matching avancé"], cta: "Choisir Premium" },
];

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Tarifs recruteurs — Samba Job Connect" },
    { name: "description", content: "Plans Starter, Business et Premium pour recruter au Sénégal. Paiement Wave, Orange Money, PayTech." },
    { property: "og:title", content: "Tarifs recruteurs — Samba Job Connect" },
    { property: "og:description", content: "Choisissez le plan adapté à vos recrutements." },
  ] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Des tarifs simples pour recruter</h1>
          <p className="mt-3 text-muted-foreground">Paiement local : Wave, Orange Money, PayTech ou virement bancaire.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-card ${p.popular ? "border-accent ring-1 ring-accent" : ""}`}>
              {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Le plus populaire</span>}
              <h2 className="text-lg font-bold uppercase tracking-wide text-primary">{p.name}</h2>
              <p className="text-sm text-muted-foreground">{p.tagline}</p>
              <ul className="mt-6 flex-1 space-y-2">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-accent" />{f}</li>)}
              </ul>
              <Button asChild variant={p.popular ? "accent" : "outline"} size="lg" className="mt-6"><Link to="/register" search={{ role: "recruiter" }}>{p.cta}</Link></Button>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Prix détaillés communiqués prochainement. Aucun paiement n'est prélevé pour le moment.</p>
      </div>
    </PageShell>
  ),
});
