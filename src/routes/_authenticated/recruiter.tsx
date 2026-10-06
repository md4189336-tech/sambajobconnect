import { createFileRoute } from "@tanstack/react-router";
import { DashboardWelcome } from "@/components/site/DashboardWelcome";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => ({ meta: [{ title: "Espace recruteur — Samba Job Connect" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <DashboardWelcome title="Votre espace recruteur"
      intro="Votre compte entreprise est prêt. La publication d'offres, l'ATS et la CVthèque arrivent à la prochaine étape."
      cta={{ to: "/pricing", label: "Voir les offres d'abonnement" }} />
  ),
});
