CREATE TABLE public.sectors (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.sectors TO anon, authenticated;
GRANT ALL ON public.sectors TO service_role;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sectors public read" ON public.sectors FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.job_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_slug text NOT NULL REFERENCES public.sectors(slug) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (sector_slug, name)
);
GRANT SELECT ON public.job_titles TO anon, authenticated;
GRANT ALL ON public.job_titles TO service_role;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job titles public read" ON public.job_titles FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_title text NOT NULL DEFAULT '';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contract text NOT NULL DEFAULT 'CDI';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

CREATE TABLE public.candidate_profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  job_title text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  skills text NOT NULL DEFAULT '',
  resume_path text,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO service_role;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidate own read" ON public.candidate_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Recruiters and admins read visible talents" ON public.candidate_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (is_visible AND public.has_role(auth.uid(),'recruiter')));
CREATE POLICY "Candidate own insert" ON public.candidate_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Candidate own update" ON public.candidate_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Resumes own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.sectors(slug,name,description,icon,sort_order) VALUES
('hotellerie','Hôtellerie','Accueil, hébergement et gestion hôtelière','Hotel',1),
('restauration','Restauration et Métiers de Bouche','Cuisine, service, bar et métiers de bouche','UtensilsCrossed',2),
('tourisme','Tourisme et Voyage','Agences, guides et circuits touristiques','Plane',3),
('evenementiel','Événementiel','Organisation, animation et technique d''événements','PartyPopper',4),
('commerce','Commerce et Vente','Vente, relation client et développement commercial','ShoppingCart',5),
('marketing','Marketing et Communication','Marque, digital, contenu et relations presse','Megaphone',6),
('informatique','Informatique et Technologie','Développement, data, réseaux et cybersécurité','Laptop',7),
('finance','Finance, Banque et Assurance','Comptabilité, audit, banque et assurance','Landmark',8)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.job_titles(sector_slug,name,sort_order) VALUES
('hotellerie','Directeur d''hôtel',1),
('hotellerie','Directeur d''exploitation',2),
('hotellerie','Responsable hébergement',3),
('hotellerie','Réceptionniste',4),
('hotellerie','Chef de réception',5),
('hotellerie','Réceptionniste de nuit',6),
('hotellerie','Concierge',7),
('hotellerie','Gouvernant(e)',8),
('hotellerie','Femme/Valet de chambre',9),
('hotellerie','Bagagiste',10),
('hotellerie','Employé polyvalent',11),
('hotellerie','Night auditor',12),
('hotellerie','Responsable réservation',13),
('hotellerie','Agent de réservation',14),
('hotellerie','Responsable housekeeping',15),
('hotellerie','Maintenance hôtelière',16),
('hotellerie','Commercial hôtelier',17),
('hotellerie','Responsable événementiel hôtelier',18),
('restauration','Chef de cuisine',1),
('restauration','Second de cuisine',2),
('restauration','Cuisinier',3),
('restauration','Commis de cuisine',4),
('restauration','Pâtissier',5),
('restauration','Boulanger',6),
('restauration','Chocolatier',7),
('restauration','Traiteur',8),
('restauration','Grillardin',9),
('restauration','Pizzaïolo',10),
('restauration','Fast-food',11),
('restauration','Chef barman',12),
('restauration','Barman',13),
('restauration','Barista',14),
('restauration','Serveur',15),
('restauration','Maître d''hôtel',16),
('restauration','Responsable restaurant',17),
('restauration','Caissier',18),
('restauration','Plongeur',19),
('restauration','Économe',20),
('restauration','Responsable stock',21),
('restauration','Livreur de repas',22),
('tourisme','Agent de voyage',1),
('tourisme','Guide touristique',2),
('tourisme','Accompagnateur touristique',3),
('tourisme','Agent de réservation',4),
('tourisme','Conseiller voyage',5),
('tourisme','Responsable agence de voyage',6),
('tourisme','Chauffeur touristique',7),
('tourisme','Animateur touristique',8),
('tourisme','Responsable excursion',9),
('tourisme','Agent d''accueil touristique',10),
('tourisme','Coordinateur de voyages',11),
('tourisme','Travel manager',12),
('evenementiel','Event manager',1),
('evenementiel','Organisateur d''événements',2),
('evenementiel','Wedding planner',3),
('evenementiel','Coordinateur événementiel',4),
('evenementiel','Décorateur',5),
('evenementiel','DJ',6),
('evenementiel','Animateur',7),
('evenementiel','Photographe',8),
('evenementiel','Vidéaste',9),
('evenementiel','Hôtesse événementielle',10),
('evenementiel','Agent d''accueil',11),
('evenementiel','Technicien son',12),
('evenementiel','Technicien lumière',13),
('evenementiel','Régisseur',14),
('evenementiel','Traiteur événementiel',15),
('evenementiel','Sécurité événementielle',16),
('commerce','Commercial',1),
('commerce','Vendeur',2),
('commerce','Conseiller clientèle',3),
('commerce','Téléconseiller',4),
('commerce','Caissier',5),
('commerce','Responsable magasin',6),
('commerce','Chef de rayon',7),
('commerce','Merchandiseur',8),
('commerce','Responsable commercial',9),
('commerce','Business developer',10),
('commerce','Sales manager',11),
('commerce','Agent de prospection',12),
('commerce','Représentant commercial',13),
('commerce','Responsable grands comptes',14),
('marketing','Responsable marketing',1),
('marketing','Assistant marketing',2),
('marketing','Community manager',3),
('marketing','Social media manager',4),
('marketing','Chargé de communication',5),
('marketing','Responsable communication',6),
('marketing','Attaché de presse',7),
('marketing','Copywriter',8),
('marketing','Rédacteur web',9),
('marketing','Graphiste',10),
('marketing','Infographiste',11),
('marketing','Brand manager',12),
('marketing','Chargé de publicité',13),
('marketing','Influenceur',14),
('marketing','Créateur de contenu',15),
('marketing','SEO/SEA specialist',16),
('informatique','Développeur web',1),
('informatique','Développeur mobile',2),
('informatique','Développeur logiciel',3),
('informatique','Administrateur réseau',4),
('informatique','Technicien informatique',5),
('informatique','Ingénieur informatique',6),
('informatique','Data analyst',7),
('informatique','Data scientist',8),
('informatique','Administrateur système',9),
('informatique','Cybersecurity specialist',10),
('informatique','UX/UI designer',11),
('informatique','Product manager',12),
('informatique','Support informatique',13),
('informatique','Technicien télécom',14),
('informatique','Consultant IT',15),
('finance','Comptable',1),
('finance','Assistant comptable',2),
('finance','Auditeur',3),
('finance','Contrôleur de gestion',4),
('finance','Analyste financier',5),
('finance','Gestionnaire de paie',6),
('finance','Conseiller bancaire',7),
('finance','Courtier en assurance',8),
('finance','Agent général d''assurance',9)
ON CONFLICT (sector_slug,name) DO NOTHING;