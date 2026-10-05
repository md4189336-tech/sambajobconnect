import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  { title: "Samba Job Connect", links: [["/about", "À propos"], ["/about", "Notre mission"], ["/about", "Contact"]] },
  { title: "Candidats", links: [["/jobs", "Trouver un emploi"], ["/register", "Créer un CV"], ["/login", "Mes candidatures"], ["/register", "Alertes"]] },
  { title: "Entreprises", links: [["/register", "Publier une offre"], ["/pricing", "CVthèque"], ["/pricing", "Tarifs"]] },
  { title: "Institutions", links: [["/institutions", "Formations"], ["/institutions", "Stages"], ["/about", "Partenariats"]] },
  { title: "Légal", links: [["/about", "Conditions d'utilisation"], ["/about", "Politique de confidentialité"], ["/about", "Cookies"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <div className="lg:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-primary-foreground/70">Trouver un emploi. Trouver les bons talents. Développer les compétences.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map(([to, label]) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60">
        © 2026 Samba Job Connect. Tous droits réservés.
      </div>
    </footer>
  );
}
