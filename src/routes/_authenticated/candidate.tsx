import { createFileRoute } from "@tanstack/react-router";
import { DashboardWelcome } from "@/components/site/DashboardWelcome";

export const Route = createFileRoute("/_authenticated/candidate")({
  head: () => ({ meta: [{ title: "Espace candidat — Samba Job Connect" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <DashboardWelcome title="Votre espace candidat"
      intro="Votre compte est prêt. Le tableau de bord complet (profil, CV, candidatures, alertes) arrive à la prochaine étape."
      cta={{ to: "/jobs", label: "Explorer les offres" }} />
  ),
});
