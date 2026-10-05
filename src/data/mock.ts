// Mock data layer — shapes mirror the planned database tables so it can be swapped later.
import {
  Hotel, HardHat, Laptop, Sprout, ShoppingCart, Landmark, HeartPulse, Truck, Zap, GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type Sector = { id: string; name: string; slug: string; icon: LucideIcon };
export const sectors: Sector[] = [
  { id: "1", name: "Hôtellerie & Tourisme", slug: "hotellerie", icon: Hotel },
  { id: "2", name: "BTP & Construction", slug: "btp", icon: HardHat },
  { id: "3", name: "TIC & Numérique", slug: "tic", icon: Laptop },
  { id: "4", name: "Agriculture", slug: "agriculture", icon: Sprout },
  { id: "5", name: "Commerce & Distribution", slug: "commerce", icon: ShoppingCart },
  { id: "6", name: "Banque & Finance", slug: "finance", icon: Landmark },
  { id: "7", name: "Santé", slug: "sante", icon: HeartPulse },
  { id: "8", name: "Transport & Logistique", slug: "transport", icon: Truck },
  { id: "9", name: "Énergie", slug: "energie", icon: Zap },
  { id: "10", name: "Éducation & Formation", slug: "education", icon: GraduationCap },
];

export const locations = ["Dakar", "Thiès", "Saint-Louis", "Kolda", "Ziguinchor", "Kaolack", "Touba"];
export const contractTypes = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Mission"] as const;
export type ContractType = (typeof contractTypes)[number];
export const experienceLevels = ["Débutant", "1-3 ans", "3-5 ans", "5 ans +"] as const;

export type Company = {
  id: string; name: string; initials: string; sector: string; location: string;
  website: string; description: string; size: string; verified: boolean;
};
export const companies: Company[] = [
  { id: "tech-africa", name: "Tech Africa Sénégal", initials: "TA", sector: "tic", location: "Dakar", website: "techafrica.sn", size: "50-200 employés", verified: true,
    description: "Entreprise de services numériques qui conçoit des solutions web et mobiles pour les PME et institutions d'Afrique de l'Ouest." },
  { id: "sendigital", name: "SenDigital", initials: "SD", sector: "tic", location: "Dakar", website: "sendigital.sn", size: "10-50 employés", verified: true,
    description: "Agence de marketing digital et de communication au service des marques sénégalaises." },
  { id: "kolda-agro", name: "Kolda Agro", initials: "KA", sector: "agriculture", location: "Kolda", website: "koldaagro.sn", size: "50-200 employés", verified: false,
    description: "Coopérative agro-industrielle spécialisée dans la transformation de produits agricoles locaux en Casamance." },
  { id: "africa-construction", name: "Africa Construction", initials: "AC", sector: "btp", location: "Thiès", website: "africaconstruction.sn", size: "200+ employés", verified: true,
    description: "Groupe de BTP réalisant des infrastructures routières, bâtiments et ouvrages d'art." },
  { id: "teranga-hospitality", name: "Teranga Hospitality", initials: "TH", sector: "hotellerie", location: "Saint-Louis", website: "terangahospitality.sn", size: "50-200 employés", verified: true,
    description: "Groupe hôtelier qui gère des établissements de charme à Saint-Louis, Saly et au Cap Skirring." },
];

export type Job = {
  id: string; title: string; companyId: string; location: string; contract: ContractType;
  salaryMin: number; salaryMax: number; sector: string; experience: (typeof experienceLevels)[number];
  remote: boolean; postedDaysAgo: number; skills: string[]; description: string;
  missions: string[]; profile: string[]; benefits: string[];
};

const j = (o: Partial<Job> & Pick<Job, "id" | "title" | "companyId" | "location" | "contract" | "salaryMin" | "salaryMax" | "sector" | "skills">): Job => ({
  experience: "1-3 ans", remote: false, postedDaysAgo: 1,
  description: `Dans le cadre de son développement, l'entreprise recrute un(e) ${o.title} motivé(e) pour renforcer ses équipes à ${o.location}.`,
  missions: ["Assurer les missions principales du poste", "Collaborer avec les équipes internes", "Rendre compte régulièrement de l'avancement"],
  profile: ["Diplôme en lien avec le poste", "Bon sens de l'organisation", "Maîtrise du français ; le wolof est un plus"],
  benefits: ["Assurance maladie", "Prime de performance", "Formation continue"],
  ...o,
});

export const jobs: Job[] = [
  j({ id: "1", title: "Développeur Full Stack", companyId: "tech-africa", location: "Dakar", contract: "CDI", salaryMin: 400000, salaryMax: 650000, sector: "tic", skills: ["React", "Node.js", "Supabase"], remote: true, postedDaysAgo: 0, experience: "3-5 ans",
    missions: ["Développer des applications web React et Node.js", "Concevoir des API et bases de données", "Participer aux revues de code"],
    profile: ["Bac+3 minimum en informatique", "3 ans d'expérience en développement web", "Maîtrise de Git et TypeScript"] }),
  j({ id: "2", title: "Technicien réseau", companyId: "sendigital", location: "Ziguinchor", contract: "CDD", salaryMin: 250000, salaryMax: 350000, sector: "tic", skills: ["Cisco", "Fibre optique", "Linux"], postedDaysAgo: 1 }),
  j({ id: "3", title: "Responsable commercial", companyId: "teranga-hospitality", location: "Saint-Louis", contract: "CDI", salaryMin: 350000, salaryMax: 500000, sector: "commerce", skills: ["Négociation", "CRM", "Anglais"], postedDaysAgo: 2, experience: "3-5 ans" }),
  j({ id: "4", title: "Comptable", companyId: "africa-construction", location: "Thiès", contract: "CDI", salaryMin: 300000, salaryMax: 450000, sector: "finance", skills: ["SYSCOHADA", "Sage", "Excel"], postedDaysAgo: 3 }),
  j({ id: "5", title: "Assistant administratif", companyId: "kolda-agro", location: "Kolda", contract: "CDD", salaryMin: 150000, salaryMax: 220000, sector: "agriculture", skills: ["Bureautique", "Archivage", "Accueil"], postedDaysAgo: 4, experience: "Débutant" }),
  j({ id: "6", title: "Agent agricole", companyId: "kolda-agro", location: "Kolda", contract: "Mission", salaryMin: 120000, salaryMax: 180000, sector: "agriculture", skills: ["Maraîchage", "Irrigation", "Récolte"], postedDaysAgo: 5, experience: "Débutant" }),
  j({ id: "7", title: "Réceptionniste hôtel", companyId: "teranga-hospitality", location: "Saint-Louis", contract: "CDI", salaryMin: 180000, salaryMax: 250000, sector: "hotellerie", skills: ["Accueil", "Anglais", "Opera PMS"], postedDaysAgo: 6 }),
  j({ id: "8", title: "Community Manager", companyId: "sendigital", location: "Dakar", contract: "Freelance", salaryMin: 200000, salaryMax: 350000, sector: "tic", skills: ["Réseaux sociaux", "Canva", "Rédaction"], remote: true, postedDaysAgo: 2 }),
  j({ id: "9", title: "Conducteur de travaux", companyId: "africa-construction", location: "Touba", contract: "CDD", salaryMin: 450000, salaryMax: 700000, sector: "btp", skills: ["AutoCAD", "Gestion de chantier", "Sécurité"], postedDaysAgo: 8, experience: "5 ans +" }),
  j({ id: "10", title: "Stagiaire marketing digital", companyId: "sendigital", location: "Dakar", contract: "Stage", salaryMin: 75000, salaryMax: 100000, sector: "tic", skills: ["SEO", "Google Ads", "Analytics"], postedDaysAgo: 3, experience: "Débutant" }),
  j({ id: "11", title: "Chef de rang", companyId: "teranga-hospitality", location: "Kaolack", contract: "Alternance", salaryMin: 120000, salaryMax: 160000, sector: "hotellerie", skills: ["Service", "Œnologie", "Anglais"], postedDaysAgo: 10, experience: "Débutant" }),
  j({ id: "12", title: "Ingénieur électricien", companyId: "africa-construction", location: "Dakar", contract: "CDI", salaryMin: 600000, salaryMax: 900000, sector: "energie", skills: ["Solaire", "Haute tension", "Normes NF C"], postedDaysAgo: 12, experience: "5 ans +" }),
];

export const getCompany = (id: string) => companies.find((c) => c.id === id);
export const getJob = (id: string) => jobs.find((x) => x.id === id);
export const sectorName = (slug: string) => sectors.find((s) => s.slug === slug)?.name ?? slug;

export const formatSalary = (min: number, max: number) =>
  `${min.toLocaleString("fr-FR")} – ${max.toLocaleString("fr-FR")} FCFA`;
export const formatPosted = (d: number) => (d === 0 ? "Aujourd'hui" : d === 1 ? "Hier" : `Il y a ${d} jours`);

export const platformStats = [
  { value: "1 250+", label: "Offres disponibles" },
  { value: "8 500+", label: "Candidats actifs" },
  { value: "350+", label: "Entreprises partenaires" },
  { value: "2 400+", label: "Talents recrutés" },
];

export const programs = [
  { id: "p1", title: "Formation en Intelligence Artificielle", institution: "Institut Numérique de Kolda", location: "Kolda", duration: "3 mois", certification: "Certification" },
  { id: "p2", title: "Développement Web Full Stack", institution: "Dakar Code Academy", location: "Dakar", duration: "6 mois", certification: "Diplôme" },
  { id: "p3", title: "Gestion hôtelière", institution: "École Teranga Tourisme", location: "Saint-Louis", duration: "9 mois", certification: "BTS" },
  { id: "p4", title: "Techniques agricoles durables", institution: "Centre Agro Casamance", location: "Ziguinchor", duration: "4 mois", certification: "Certification" },
];
export const institutions = [
  { id: "i1", name: "Institut Numérique de Kolda", type: "Centre de formation", location: "Kolda" },
  { id: "i2", name: "Dakar Code Academy", type: "École privée", location: "Dakar" },
  { id: "i3", name: "École Teranga Tourisme", type: "École professionnelle", location: "Saint-Louis" },
];
