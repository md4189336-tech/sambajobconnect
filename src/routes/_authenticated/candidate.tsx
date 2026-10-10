import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, UserPen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { ResumeUpload } from "@/components/site/ResumeUpload";
import { candidateOptions } from "@/lib/candidate-queries";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/candidate")({
  head: () => pageMeta("Espace candidat", "Votre profil candidat et votre CV privé.", true),
  loader: ({ context }) => context.queryClient.ensureQueryData(candidateOptions(context.user.id)),
  errorComponent: () => <PageShell><p role="alert" className="p-10 text-center">Impossible de charger votre espace. Actualisez la page.</p></PageShell>,
  notFoundComponent: () => <p>Espace introuvable.</p>,
  component: CandidatePage,
});

function CandidatePage() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(candidateOptions(user.id));
  const qc = useQueryClient(); const navigate = useNavigate();
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };
  return <PageShell><div className="mx-auto max-w-4xl px-4 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-accent">Espace candidat</p><h1 className="mt-2 text-3xl font-bold text-primary">Bonjour {data.name.split(" ")[0]}</h1></div><Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button></div>
    <div className="my-8 flex flex-wrap gap-3"><Button asChild variant="accent" size="lg"><Link to="/profile"><UserPen />Compléter mon profil</Link></Button><Button asChild variant="outline" size="lg"><Link to="/jobs"><Search />Explorer les offres</Link></Button></div>
    {data.candidate?.headline && <p className="mb-6 text-muted-foreground">{data.candidate.headline} · {data.candidate.location}</p>}
    <ResumeUpload userId={user.id} resumePath={data.candidate?.resume_path} />
  </div></PageShell>;
}
