// Sector → job title taxonomy. Mirrors the `sectors` / `job_titles` tables (same slugs & names).
import { Hotel, UtensilsCrossed, Plane, PartyPopper, ShoppingCart, Megaphone, Laptop, Landmark, type LucideIcon } from "lucide-react";

export type Sector = { id: string; slug: string; name: string; icon: LucideIcon; description: string; jobTitles: string[] };

export const sectors: Sector[] = [
  { id: "1", slug: "hotellerie", name: "Hôtellerie", icon: Hotel, description: "Accueil, hébergement et gestion hôtelière",
    jobTitles: ["Directeur d'hôtel", "Directeur d'exploitation", "Responsable hébergement", "Réceptionniste", "Chef de réception", "Réceptionniste de nuit", "Concierge", "Gouvernant(e)", "Femme/Valet de chambre", "Bagagiste", "Employé polyvalent", "Night auditor", "Responsable réservation", "Agent de réservation", "Responsable housekeeping", "Maintenance hôtelière", "Commercial hôtelier", "Responsable événementiel hôtelier"] },
  { id: "2", slug: "restauration", name: "Restauration et Métiers de Bouche", icon: UtensilsCrossed, description: "Cuisine, service, bar et métiers de bouche",
    jobTitles: ["Chef de cuisine", "Second de cuisine", "Cuisinier", "Commis de cuisine", "Pâtissier", "Boulanger", "Chocolatier", "Traiteur", "Grillardin", "Pizzaïolo", "Fast-food", "Chef barman", "Barman", "Barista", "Serveur", "Maître d'hôtel", "Responsable restaurant", "Caissier", "Plongeur", "Économe", "Responsable stock", "Livreur de repas"] },
  { id: "3", slug: "tourisme", name: "Tourisme et Voyage", icon: Plane, description: "Agences, guides et circuits touristiques",
    jobTitles: ["Agent de voyage", "Guide touristique", "Accompagnateur touristique", "Agent de réservation", "Conseiller voyage", "Responsable agence de voyage", "Chauffeur touristique", "Animateur touristique", "Responsable excursion", "Agent d'accueil touristique", "Coordinateur de voyages", "Travel manager"] },
  { id: "4", slug: "evenementiel", name: "Événementiel", icon: PartyPopper, description: "Organisation, animation et technique d'événements",
    jobTitles: ["Event manager", "Organisateur d'événements", "Wedding planner", "Coordinateur événementiel", "Décorateur", "DJ", "Animateur", "Photographe", "Vidéaste", "Hôtesse événementielle", "Agent d'accueil", "Technicien son", "Technicien lumière", "Régisseur", "Traiteur événementiel", "Sécurité événementielle"] },
  { id: "5", slug: "commerce", name: "Commerce et Vente", icon: ShoppingCart, description: "Vente, relation client et développement commercial",
    jobTitles: ["Commercial", "Vendeur", "Conseiller clientèle", "Téléconseiller", "Caissier", "Responsable magasin", "Chef de rayon", "Merchandiseur", "Responsable commercial", "Business developer", "Sales manager", "Agent de prospection", "Représentant commercial", "Responsable grands comptes"] },
  { id: "6", slug: "marketing", name: "Marketing et Communication", icon: Megaphone, description: "Marque, digital, contenu et relations presse",
    jobTitles: ["Responsable marketing", "Assistant marketing", "Community manager", "Social media manager", "Chargé de communication", "Responsable communication", "Attaché de presse", "Copywriter", "Rédacteur web", "Graphiste", "Infographiste", "Brand manager", "Chargé de publicité", "Influenceur", "Créateur de contenu", "SEO/SEA specialist"] },
  { id: "7", slug: "informatique", name: "Informatique et Technologie", icon: Laptop, description: "Développement, data, réseaux et cybersécurité",
    jobTitles: ["Développeur web", "Développeur mobile", "Développeur logiciel", "Administrateur réseau", "Technicien informatique", "Ingénieur informatique", "Data analyst", "Data scientist", "Administrateur système", "Cybersecurity specialist", "UX/UI designer", "Product manager", "Support informatique", "Technicien télécom", "Consultant IT"] },
  { id: "8", slug: "finance", name: "Finance, Banque et Assurance", icon: Landmark, description: "Comptabilité, audit, banque et assurance",
    jobTitles: ["Comptable", "Assistant comptable", "Auditeur", "Contrôleur de gestion", "Analyste financier", "Gestionnaire de paie", "Conseiller bancaire", "Courtier en assurance", "Agent général d'assurance"] },
];

export const getSector = (slug?: string | null) => sectors.find((s) => s.slug === slug);
export const jobTitlesFor = (slug?: string | null) => getSector(slug)?.jobTitles ?? [];
