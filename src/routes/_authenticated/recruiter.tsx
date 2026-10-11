import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardWelcome } from "@/components/site/DashboardWelcome";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => pageMeta("Espace recruteur", "Publiez vos offres et accédez à votre espace de recrutement.", true),
  component: () => (
    <>
    <DashboardWelcome title="Votre espace recruteur"
      intro="Votre compte entreprise est prêt."
      cta={{ to: "/pricing", label: "Voir les offres d'abonnement" }} />
    <div className="fixed bottom-4 right-4 z-30"><Button asChild variant="accent" size="lg"><Link to="/post-job">Publier une offre</Link></Button></div>
    </>
  ),
});
