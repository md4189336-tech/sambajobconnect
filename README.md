# Samba Connect

SAMBA JOB CONNECT — APPLICATION WEB DE RECRUTEMENT AFRICAINE



Construis une application web complète, moderne, professionnelle, responsive et mobile-first appelée Samba Job Connect.



Samba Job Connect est une plateforme digitale de recrutement et de mise en relation entre candidats, entreprises, recruteurs et institutions de formation, conçue d'abord pour le Sénégal puis extensible à toute l'Afrique.



L'objectif est de créer un véritable produit SaaS professionnel, pas une simple landing page.



---



1. OBJECTIF PRODUIT



Créer une plateforme permettant de :



- rechercher des emplois ;

- publier des offres d'emploi ;

- créer et gérer des profils professionnels ;

- créer un CV professionnel ;

- postuler rapidement à une offre ;

- suivre ses candidatures ;

- permettre aux entreprises de gérer leurs recrutements ;

- fournir un ATS aux recruteurs ;

- permettre aux recruteurs de rechercher des candidats dans une CVthèque ;

- permettre aux écoles et centres de formation de publier leurs formations ;

- connecter les étudiants aux entreprises ;

- gérer des abonnements et paiements locaux ;

- préparer l'intégration future de fonctionnalités IA de matching.



Positionnement :



Samba Job Connect



«Trouver un emploi. Trouver les bons talents. Développer les compétences.»



Le produit doit inspirer :

confiance, simplicité, professionnalisme, accessibilité et innovation africaine.



---



2. STACK TECHNIQUE



Utiliser :



- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Lucide React

- React Router

- TanStack Query si nécessaire

- Supabase pour le backend

- PostgreSQL via Supabase

- Supabase Auth

- Supabase Storage

- Supabase Row Level Security

- PWA-ready



Le code doit être propre, modulaire, réutilisable et facilement maintenable.



Ne pas créer une architecture inutilement complexe.



---



3. DESIGN SYSTEM



Couleurs principales



Deep Navy :



"#0B1F3A"



Emerald Green :



"#0F9D68"



Background :



"#F7F8FA"



Text :



"#172033"



White :



"#FFFFFF"



Utiliser éventuellement des nuances plus claires de Navy et Emerald pour les états hover, backgrounds et badges.



Le Navy représente :



- confiance ;

- professionnalisme ;

- entreprise ;

- technologie.



L'Emerald représente :



- croissance ;

- opportunité ;

- innovation ;

- Afrique.



Le design doit rester sobre et premium.



---



4. STYLE VISUEL



Créer une interface :



- moderne ;

- professionnelle ;

- minimaliste ;

- lumineuse ;

- accessible ;

- rapide ;

- mobile-first.



Éviter :



- gradients excessifs ;

- animations lourdes ;

- effets 3D inutiles ;

- interfaces surchargées ;

- trop de couleurs ;

- gros blocs décoratifs qui ralentissent le chargement.



Utiliser :



- cartes propres ;

- bordures légères ;

- ombres très discrètes ;

- coins légèrement arrondis ;

- icônes Lucide ;

- espaces généreux ;

- typographie lisible.



L'interface doit ressembler à un produit SaaS professionnel de niveau international, tout en ayant une identité africaine moderne.



---



5. RESPONSIVE / MOBILE-FIRST



Concevoir d'abord pour :



- 360px

- 390px

- 768px

- 1024px

- 1280px+



L'application doit être parfaitement utilisable sur smartphone Android.



Touch targets minimum recommandées : environ 44px.



Sur mobile :



- navigation simplifiée ;

- boutons pleine largeur lorsque nécessaire ;

- cartes empilées ;

- filtres dans un drawer/bottom sheet ;

- CTA principal facilement accessible ;

- navigation inférieure pour les espaces connectés.



Préparer également la PWA.



---



6. LANDING PAGE "/"



Créer une page d'accueil professionnelle.



Header desktop



Logo :



SAMBA JOB CONNECT



Navigation :



- Accueil

- Emplois

- Entreprises

- Formations

- Tarifs

- À propos



Actions :



Se connecter



Créer un compte



Mobile



Logo + menu hamburger.



---



7. HERO



Titre principal :



Trouvez votre prochaine opportunité professionnelle



Sous-titre :



Des opportunités d'emploi, de stages et de formations pour les talents au Sénégal et en Afrique.



Créer un moteur de recherche central :



Champ 1 :



Que recherchez-vous ?



Placeholder :



"Ex : Développeur, Comptable, Commercial..."



Champ 2 :



Où ?



Placeholder :



"Dakar, Kolda, Ziguinchor..."



Champ 3 :



Secteur



Valeur par défaut :



"Tous les secteurs"



Bouton principal :



Rechercher un emploi



Sous la recherche :



1 250+ offres disponibles



Utiliser des données de démonstration au départ.



---



8. STATISTIQUES



Créer quatre cartes :



1 250+

Offres disponibles



8 500+

Candidats actifs



350+

Entreprises partenaires



2 400+

Talents recrutés



Préparer ces valeurs pour être remplacées ultérieurement par des données Supabase.



---



9. SECTEURS



Titre :



Explorez les opportunités par secteur



Créer une grille responsive.



Secteurs :



- Hôtellerie & Tourisme

- BTP & Construction

- TIC & Numérique

- Agriculture

- Commerce & Distribution

- Banque & Finance

- Santé

- Transport & Logistique

- Énergie

- Éducation & Formation



Chaque secteur doit être cliquable et rediriger vers "/jobs" avec le filtre correspondant.



Utiliser des icônes Lucide adaptées.



---



10. OFFRES D'EMPLOI EN VEDETTE



Créer une section :



Dernières opportunités



Afficher 6 offres de démonstration.



Chaque carte doit contenir :



- logo entreprise ;

- titre ;

- entreprise ;

- localisation ;

- type de contrat ;

- salaire ;

- date ;

- compétences ;

- badge éventuellement "Nouveau" ;

- bouton "Voir l'offre" ;

- bouton "Postuler".



Exemple :



Développeur Full Stack



Tech Africa Sénégal



📍 Dakar



CDI



400 000 – 650 000 FCFA



Tags :



React

Node.js

Supabase



---



11. CTA CANDIDATS



Créer une section dédiée :



Votre prochaine opportunité commence ici.



Texte :



Créez votre profil professionnel, ajoutez votre CV et postulez rapidement aux offres qui correspondent à vos compétences.



Boutons :



Créer mon profil



Importer mon CV



---



12. CTA ENTREPRISES



Section :



Trouvez les talents dont votre entreprise a besoin.



Texte :



Publiez vos offres, gérez vos candidatures et trouvez rapidement les meilleurs profils.



Bouton :



Publier une offre



---



13. PAGE "/jobs"



Créer une page complète de recherche d'emploi.



En haut :



Trouver un emploi



Moteur de recherche :



- mot-clé ;

- localisation ;

- secteur.



Filtres :



- secteur ;

- type de contrat ;

- localisation ;

- salaire ;

- expérience ;

- télétravail ;

- date de publication.



Types de contrats :



- CDI

- CDD

- Stage

- Freelance

- Alternance

- Mission



Desktop :



sidebar de filtres + liste d'offres.



Mobile :



bouton :



Filtres



ouvrant un drawer.



Afficher :



"125 offres trouvées"



Prévoir tri :



- Plus récentes

- Pertinence

- Salaire le plus élevé



---



14. PAGE "/jobs/:id"



Créer une page détail d'offre professionnelle.



Afficher :



- titre ;

- entreprise ;

- logo ;

- localisation ;

- contrat ;

- salaire ;

- date ;

- expérience ;

- description ;

- missions ;

- profil recherché ;

- compétences ;

- avantages ;

- présentation entreprise.



CTA principal :



Postuler maintenant



Sur mobile, le bouton doit rester visible via une barre sticky en bas.



Ajouter :



Enregistrer l'offre



Partager



Signaler cette offre



---



15. AUTHENTIFICATION



Créer :



"/login"



"/register"



"/forgot-password"



Utiliser Supabase Auth.



Méthodes :



- email + mot de passe ;

- préparation pour Google OAuth ;

- éventuellement téléphone/OTP plus tard.



Lors de l'inscription, demander le rôle :



Je suis :



👤 Candidat



🏢 Entreprise / Recruteur



🎓 Institution de formation



Ne pas afficher "Super Admin" comme option publique d'inscription.



Le rôle admin doit être attribué uniquement via backend/database.



---



16. ONBOARDING



Après inscription, créer un onboarding différent selon le rôle.



Candidat



Demander :



- prénom ;

- nom ;

- téléphone ;

- email ;

- ville ;

- métier recherché ;

- secteur ;

- expérience ;

- compétences ;

- CV.



Recruteur



Demander :



- nom entreprise ;

- logo ;

- secteur ;

- localisation ;

- site web ;

- description ;

- taille entreprise.



Institution



Demander :



- nom ;

- type d'établissement ;

- localisation ;

- description ;

- site web ;

- formations principales.



Afficher une barre de progression pendant l'onboarding.



---



17. DASHBOARD CANDIDAT "/candidate"



Créer un dashboard moderne.



Header :



Bonjour 👋



Afficher :



Votre profil est complété à 75 %



Progress bar.



CTA :



Compléter mon profil



Stats :



- candidatures ;

- entretiens ;

- offres sauvegardées ;

- profil consulté.



---



18. CANDIDATURES



Créer :



"/candidate/applications"



Afficher un tableau desktop et des cartes mobile.



Statuts :



🟡 Soumise



🔵 En cours d'étude



🟣 Entretien



🟢 Acceptée



🔴 Refusée



Permettre de filtrer par statut.



---



19. CV BUILDER



Créer :



"/candidate/cv"



Interface de création de CV.



Sections :



Informations personnelles



- nom ;

- prénom ;

- téléphone ;

- email ;

- ville ;

- photo ;

- titre professionnel ;

- résumé.



Expériences



- entreprise ;

- poste ;

- date début ;

- date fin ;

- description.



Formation



- établissement ;

- diplôme ;

- domaine ;

- année.



Compétences



Créer des tags dynamiques.



Certifications



Langues



Références



À droite sur desktop :



Aperçu du CV



Sur mobile :



onglets :



Édition | Aperçu



Bouton :



Télécharger mon CV PDF



Préparer l'architecture pour générer un vrai PDF ultérieurement.



---



20. ALERTES



Créer :



"/candidate/alerts"



Préférences :



☑ Email



☑ WhatsApp



☑ SMS



Filtres d'alertes :



- métier ;

- secteur ;

- localisation ;

- type de contrat ;

- salaire minimum.



Exemple :



Nouvelle offre correspondant à votre profil



Technicien réseau — Ziguinchor



Voir l'offre



---



21. DASHBOARD RECRUTEUR "/recruiter"



Créer un dashboard professionnel.



Afficher :



Bonjour Tech Africa 👋



Statistiques :



- 12 offres actives ;

- 184 candidatures ;

- 23 candidats shortlistés ;

- 7 entretiens ;

- 3 recrutements.



Créer un graphique simple pour les candidatures dans le temps.



---



22. GESTION DES OFFRES RECRUTEUR



Route :



"/recruiter/jobs"



Actions :



- créer ;

- modifier ;

- fermer ;

- supprimer ;

- dupliquer.



Bouton :



+ Publier une offre



Formulaire :



- titre ;

- description ;

- missions ;

- profil recherché ;

- secteur ;

- localisation ;

- salaire ;

- contrat ;

- expérience ;

- compétences ;

- date limite.



Prévoir sauvegarde en brouillon.



---



23. ATS



Route :



"/recruiter/applications"



Créer un Kanban.



Colonnes :



Reçues



Shortlistés



Entretien



Embauchés



Refusés



Les candidats doivent pouvoir être déplacés entre les colonnes.



Chaque carte :



- photo/avatar ;

- nom ;

- poste ;

- expérience ;

- compétences ;

- date de candidature.



Préparer une structure compatible avec drag-and-drop.



---



24. CVTHÈQUE



Route :



"/recruiter/candidates"



Créer un moteur de recherche de candidats.



Recherche :



"React + Node.js"



Filtres :



- localisation ;

- expérience ;

- niveau d'études ;

- secteur ;

- compétences ;

- disponibilité.



Carte candidat :



Mamadou Diallo



Développeur Full Stack



📍 Dakar



Bac+3



2 ans d'expérience



Tags :



React

Node.js

Supabase

Git



Afficher un score :



92 % compatible



Le score doit être simulé dans la première version.



---



25. PROFIL ENTREPRISE



Créer :



"/company/:id"



Afficher :



- logo ;

- nom ;

- secteur ;

- localisation ;

- site web ;

- description ;

- taille ;

- offres disponibles.



Badge :



✓ Entreprise vérifiée



Prévoir système de vérification administrateur.



---



26. PORTAIL INSTITUTIONS "/institutions"



Créer une page publique listant les institutions et formations.



Sections :



Formations populaires



Institutions partenaires



Opportunités de stage



Créer des cartes de formation.



Exemple :



Formation en Intelligence Artificielle



📍 Kolda



⏱️ 3 mois



🎓 Certification



Bouton :



Voir la formation



---



27. DASHBOARD INSTITUTION



Route :



"/institution/dashboard"



Fonctions :



- gérer profil ;

- publier formation ;

- gérer étudiants ;

- publier stages ;

- voir entreprises partenaires ;

- suivre placements.



Créer également :



"/institution/programs"



"/institution/internships"



---



28. PAGE PRICING "/pricing"



Créer trois plans.



STARTER



1 offre



Pour les petites entreprises.



Inclure :



- 1 offre ;

- gestion candidatures ;

- tableau de bord.



CTA :



Commencer



---



BUSINESS



Abonnement mensuel



Inclure :



- offres multiples ;

- ATS ;

- statistiques ;

- gestion avancée des candidatures.



CTA :



Choisir Business



Mettre ce plan en avant comme :



Le plus populaire



---



PREMIUM



CVthèque



Inclure :



- recherche avancée ;

- accès aux profils ;

- filtres avancés ;

- contact candidats ;

- matching avancé.



CTA :



Choisir Premium



---



29. PAIEMENTS



Créer une interface de paiement prête pour intégration future.



Méthodes :



🟢 Wave



🟠 Orange Money



💳 PayTech



🏦 Virement bancaire



Pour le MVP, simuler le paiement avec un état :



Paiement en attente



Paiement réussi



Paiement échoué



Ne pas prétendre qu'un paiement réel est effectué tant que les API ne sont pas intégrées.



---



30. ADMIN DASHBOARD



Créer :



"/admin"



Interface protégée.



Menu :



- Dashboard

- Utilisateurs

- Candidats

- Entreprises

- Institutions

- Offres

- Candidatures

- Formations

- Paiements

- Abonnements

- Signalements

- Paramètres



Dashboard statistiques :



- utilisateurs ;

- candidats ;

- entreprises ;

- offres ;

- candidatures ;

- recrutements ;

- revenus.



---



31. MODÉRATION



Créer un système de signalement.



Une offre peut être :



🚩 Signalée



L'admin peut :



- examiner ;

- approuver ;

- masquer ;

- supprimer.



Même principe pour les entreprises.



---



32. BASE DE DONNÉES SUPABASE



Créer une architecture prête pour Supabase.



Tables principales :



profiles



- id

- user_id

- role

- first_name

- last_name

- phone

- city

- avatar_url

- bio

- completion_percentage

- created_at



companies



- id

- owner_id

- name

- logo_url

- sector_id

- location

- website

- description

- verified

- created_at



institutions



- id

- owner_id

- name

- type

- logo_url

- location

- website

- description

- verified



jobs



- id

- company_id

- title

- description

- requirements

- responsibilities

- sector_id

- location

- employment_type

- salary_min

- salary_max

- experience_level

- remote

- status

- deadline

- created_at



applications



- id

- job_id

- candidate_id

- cv_url

- cover_letter

- status

- created_at

- updated_at



sectors



- id

- name

- slug

- icon



skills



- id

- name



candidate_skills



- candidate_id

- skill_id



education



- id

- candidate_id

- institution

- degree

- field

- start_date

- end_date



experience



- id

- candidate_id

- company

- position

- start_date

- end_date

- description



certifications



- id

- candidate_id

- name

- issuer

- date



training_programs



- id

- institution_id

- title

- description

- duration

- location

- certification



notifications



- id

- user_id

- type

- title

- message

- read

- created_at



subscriptions



- id

- company_id

- plan

- status

- start_date

- end_date



payments



- id

- user_id

- amount

- currency

- method

- status

- reference

- created_at



---



33. RÔLES ET SÉCURITÉ



Implémenter une logique RBAC.



Roles :



"candidate"



"recruiter"



"institution"



"admin"



Utiliser Supabase Row Level Security.



Candidat :



- peut modifier son propre profil ;

- peut voir ses propres candidatures ;

- peut créer une candidature ;

- ne peut pas modifier les candidatures d'autres candidats.



Recruteur :



- peut gérer ses propres entreprises ;

- peut créer et modifier ses propres offres ;

- peut voir les candidatures de ses offres ;

- peut modifier le statut de ces candidatures.



Institution :



- peut gérer ses propres formations ;

- peut gérer ses stages.



Admin :



- accès complet.



Ne jamais exposer les clés secrètes Supabase côté frontend.



---



34. DONNÉES DE DÉMONSTRATION



Si Supabase n'est pas encore connecté, créer un mock data layer propre.



Ajouter plusieurs exemples réalistes :



Entreprises :



- Tech Africa Sénégal

- SenDigital

- Kolda Agro

- Africa Construction

- Teranga Hospitality



Offres :



- Développeur Full Stack

- Technicien réseau

- Responsable commercial

- Comptable

- Assistant administratif

- Agent agricole

- Réceptionniste hôtel

- Community Manager



Localisations :



- Dakar

- Thiès

- Saint-Louis

- Kolda

- Ziguinchor

- Kaolack

- Touba



Les données doivent être clairement structurées afin de pouvoir être remplacées par Supabase.



---



35. MATCHING INTELLIGENT



Préparer le produit pour un futur moteur de matching IA.



Afficher par exemple :



92 % compatible



Basé sur :



- compétences ;

- expérience ;

- formation ;

- localisation ;

- type de contrat ;

- secteur.



Pour la première version, utiliser un calcul simple simulé.



Ne pas intégrer une API IA payante sans nécessité.



---



36. WHATSAPP / SMS



Préparer les structures nécessaires pour les notifications.



Ne pas prétendre envoyer réellement des messages si aucune API n'est connectée.



Créer simplement :



- préférences ;

- templates ;

- historique.



Prévoir une intégration future avec un fournisseur WhatsApp/SMS.



---



37. PWA



Configurer le projet pour être PWA-ready.



Prévoir :



- manifest ;

- icône ;

- thème ;

- installation ;

- cache des assets ;

- stratégie offline légère.



La priorité est la vitesse.



---



38. ACCESSIBILITÉ



Respecter autant que possible WCAG.



Utiliser :



- labels de formulaire ;

- contraste suffisant ;

- navigation clavier ;

- focus visible ;

- aria-labels lorsque nécessaire ;

- boutons compréhensibles ;

- messages d'erreur clairs.



---



39. SEO



Ajouter :



- title ;

- meta description ;

- Open Graph ;

- URLs propres ;

- structure sémantique ;

- titres H1/H2 corrects.



Exemple :



Title :



Samba Job Connect — Trouvez votre emploi au Sénégal et en Afrique



Description :



Trouvez des emplois, stages et opportunités professionnelles au Sénégal et en Afrique avec Samba Job Connect.



---



40. ÉTATS DE L'INTERFACE



Toutes les pages doivent prévoir :



- loading state ;

- skeleton ;

- empty state ;

- error state ;

- success toast ;

- confirmation dialog.



Exemple :



Aucune candidature :



Vous n'avez encore postulé à aucune offre.



CTA :



Explorer les offres



---



41. NOTIFICATIONS



Créer un système de notifications dans l'interface.



Exemples :



🔔 Nouvelle offre correspondant à votre profil



📄 Votre candidature a été consultée



🎯 Vous êtes invité à un entretien



✅ Votre candidature a été acceptée



💼 Une entreprise a consulté votre profil



---



42. NAVIGATION MOBILE



Pour candidat :



Accueil | Emplois | Favoris | Candidatures | Profil



Pour recruteur :



Dashboard | Offres | Candidats | ATS | Profil



Pour institution :



Dashboard | Formations | Stages | Partenaires | Profil



Utiliser Lucide icons.



---



43. PERFORMANCE



Priorité absolue à la performance.



Éviter :



- images lourdes ;

- bibliothèques inutiles ;

- animations excessives ;

- appels réseau inutiles.



Utiliser :



- lazy loading ;

- pagination ;

- images optimisées ;

- composants réutilisables ;

- cache ;

- chargement progressif.



La plateforme doit fonctionner correctement avec une connexion mobile limitée.



---



44. LANGUE



L'interface principale doit être en français.



Préparer cependant l'architecture pour l'internationalisation future :



- Français ;

- English ;

- Wolof éventuellement.



---



45. FOOTER



Créer un footer professionnel.



Colonnes :



Samba Job Connect



À propos



Notre mission



Contact



Candidats



Trouver un emploi



Créer un CV



Mes candidatures



Alertes



Entreprises



Publier une offre



CVthèque



Tarifs



Institutions



Formations



Stages



Partenariats



Légal



Conditions d'utilisation



Politique de confidentialité



Cookies



Ajouter :



© 2026 Samba Job Connect. Tous droits réservés.



---



46. RÈGLES IMPORTANTES POUR LOVABLE



Ne crée pas uniquement des écrans statiques.



Créer une application fonctionnelle avec :



- routing ;

- états ;

- formulaires ;

- validation ;

- navigation ;

- authentification préparée ;

- rôles ;

- données mockées ;

- architecture Supabase prête ;

- responsive design.



Tous les boutons principaux doivent avoir une action.



Ne pas créer de liens morts.



Les modales doivent fonctionner.



Les filtres doivent fonctionner côté frontend avec les données de démonstration.



Les recherches doivent fonctionner.



Les changements de statut ATS doivent fonctionner localement.



Les formulaires doivent afficher validation et feedback.



---



47. PRIORITÉ MVP



Si toutes les fonctionnalités ne peuvent pas être implémentées simultanément, respecter cet ordre :



PRIORITÉ 1



- Landing page

- Authentification

- Sélection du rôle

- Profils

- Recherche d'emploi

- Liste des offres

- Détail d'une offre



PRIORITÉ 2



- Candidature

- Dashboard candidat

- CV Builder

- Suivi candidatures



PRIORITÉ 3



- Dashboard recruteur

- Publication d'offres

- ATS

- CVthèque



PRIORITÉ 4



- Institutions

- Formations

- Stages



PRIORITÉ 5



- Pricing

- Paiements

- Administration



PRIORITÉ 6



- Matching intelligent

- WhatsApp

- SMS

- PWA avancée

- IA



---



48. OBJECTIF FINAL



Le résultat final doit donner l'impression d'une véritable startup africaine de recrutement prête à être présentée à :



- des entreprises ;

- des candidats ;

- des écoles ;

- des investisseurs ;

- des partenaires institutionnels.



L'application doit être :



professionnelle + rapide + moderne + accessible + mobile-first + évolutive.



Le produit doit avoir une identité forte :



SAMBA JOB CONNECT



Trouver un emploi. Trouver les bons talents. Développer les compétences.



Commence par construire l'architecture complète, les routes, le design system, les composants réutilisables et les principales interfaces.



Ensuite implémente les fonctionnalités progressivement sans casser les fonctionnalités déjà créées.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sambajobconnect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef9730bd-dd1e-4556-8ee4-24a4898ecdda).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
