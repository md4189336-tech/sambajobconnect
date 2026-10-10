import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  { title: "Samba Job Connect", links: [["/about", "À propos"], ["/about", "Notre mission"], ["/contact", "Contact"]] },
  { title: "Candidats", links: [["/jobs", "Trouver un emploi"], ["/profile", "Mon profil et CV"], ["/candidate", "Mon espace"]] },
  { title: "Entreprises", links: [["/post-job", "Publier une offre"], ["/pricing", "CVthèque"], ["/pricing", "Tarifs"]] },
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
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-3 px-4 pb-8 text-sm lg:px-8">
        <a className="flex min-h-11 items-center hover:underline" href="tel:+221773806886">+221 77 380 68 86</a>
        <a className="flex min-h-11 items-center hover:underline" href="tel:+242065707472">+242 06 570 74 72</a>
        <a className="flex min-h-11 items-center break-all hover:underline" href="mailto:managementaziz221@gmail.com">managementaziz221@gmail.com</a>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60">
        © 2026 Samba Job Connect. Tous droits réservés.
      </div>
    </footer>
  );
}
