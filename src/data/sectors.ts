import {
  BriefcaseBusiness,
  Building2,
  Factory,
  Globe2,
  Hammer,
  Heart,
  Hotel,
  Leaf,
  Megaphone,
  ShieldCheck,
  Ship,
  Sparkles,
  Trophy,
  type LucideIcon,
  UtensilsCrossed,
  Scale,
} from "lucide-react";

export type Sector = {
  id: string;
  slug: string;
  name: string;
  icon: LucideIcon;
  description: string;
  jobTitles: string[];
};

export const sectors: Sector[] = [
  {
    id: "hotellerie-restauration",
    slug: "hotellerie-restauration",
    name: "Hôtellerie, restauration et métiers de bouche",
    icon: UtensilsCrossed,
    description: "Cuisine, pâtisserie, bar, réception, gouvernance et traiteur.",
    jobTitles: ["Cuisinier", "Chef de cuisine", "Pâtissier", "Boulanger", "Barman", "Barista", "Réceptionniste", "Gouvernant", "Traiteur", "Serveur"],
  },
  {
    id: "nettoyage-services-entreprises",
    slug: "nettoyage-services-entreprises",
    name: "Nettoyage et services aux entreprises",
    icon: Sparkles,
    description: "Entretien, gouvernance, supervision et housekeeping.",
    jobTitles: ["Agent d'entretien", "Gouvernant", "Superviseur housekeeping", "Major d'homme superviseur", "Nounou"],
  },
  {
    id: "services-personne",
    slug: "services-personne",
    name: "Services à la personne",
    icon: Heart,
    description: "Garde d'enfants, aide à domicile et accompagnement.",
    jobTitles: ["Garde d'enfants", "Nounou", "Aide à domicile", "Accompagnant à la personne", "Employé de maison / housekeeping"],
  },
  {
    id: "industrie-maintenance",
    slug: "industrie-maintenance",
    name: "Industrie et maintenance",
    icon: Factory,
    description: "Électricité, mécanique, maintenance et opérations.",
    jobTitles: ["Électricien", "Mécanicien", "Technicien de maintenance", "Opérateur de production"],
  },
  {
    id: "immobilier-batiments",
    slug: "immobilier-batiments",
    name: "Immobilier et gestion de bâtiments",
    icon: Building2,
    description: "Transaction, gestion immobilière et maintenance de bâtiments.",
    jobTitles: ["Agent immobilier", "Gestionnaire immobilier", "Technicien de maintenance bâtiment"],
  },
  {
    id: "securite-prevention",
    slug: "securite-prevention",
    name: "Sécurité et prévention",
    icon: ShieldCheck,
    description: "Sécurité des personnes, des biens et prévention HSE.",
    jobTitles: ["Agent de sécurité", "Responsable HSE", "Préventeur sécurité"],
  },
  {
    id: "communication-marketing-medias",
    slug: "communication-marketing-medias",
    name: "Communication, marketing et médias",
    icon: Megaphone,
    description: "Communication, création, vidéo et marketing numérique.",
    jobTitles: ["Community manager", "Graphiste", "Vidéaste", "Chargé de communication"],
  },
  {
    id: "artisanat-metiers-manuels",
    slug: "artisanat-metiers-manuels",
    name: "Artisanat et métiers manuels",
    icon: Hammer,
    description: "Métiers de fabrication, d'installation et de réparation.",
    jobTitles: ["Couturier", "Menuisier", "Plombier", "Soudeur"],
  },
  {
    id: "environnement-economie-verte",
    slug: "environnement-economie-verte",
    name: "Environnement et économie verte",
    icon: Leaf,
    description: "Recyclage, déchets et énergies renouvelables.",
    jobTitles: ["Agent de recyclage", "Gestionnaire des déchets", "Technicien énergies renouvelables"],
  },
  {
    id: "ong-developpement-cooperation",
    slug: "ong-developpement-cooperation",
    name: "ONG, développement et coopération",
    icon: Globe2,
    description: "Projets, opérations terrain et suivi-évaluation.",
    jobTitles: ["Chef de projet ONG", "Agent de terrain", "Chargé de suivi-évaluation"],
  },
  {
    id: "droit-services-professionnels",
    slug: "droit-services-professionnels",
    name: "Droit et services professionnels",
    icon: Scale,
    description: "Conseil juridique, expertise et services aux organisations.",
    jobTitles: ["Juriste", "Assistant juridique", "Consultant"],
  },
  {
    id: "sport-loisirs-evenementiel",
    slug: "sport-loisirs-evenementiel",
    name: "Sport, loisirs et événementiel",
    icon: Trophy,
    description: "Coaching, animation et organisation d'événements.",
    jobTitles: ["Coach sportif", "Animateur", "Organisateur d'événements"],
  },
  {
    id: "import-export-commerce-international",
    slug: "import-export-commerce-international",
    name: "Import-export et commerce international",
    icon: Ship,
    description: "Transit, douane, achats et approvisionnement.",
    jobTitles: ["Agent de transit", "Déclarant en douane", "Acheteur", "Responsable approvisionnement"],
  },
  {
    id: "independant-entrepreneuriat",
    slug: "independant-entrepreneuriat",
    name: "Travail indépendant et entrepreneuriat",
    icon: BriefcaseBusiness,
    description: "Activités indépendantes, prestation et conseil.",
    jobTitles: ["Freelance", "Prestataire de services", "Consultant indépendant"],
  },
];

export const getSector = (slug?: string | null) => sectors.find((sector) => sector.slug === slug);
export const jobTitlesFor = (slug?: string | null) => getSector(slug)?.jobTitles ?? [];
