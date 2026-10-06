import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "./PageShell";
import { supabase } from "@/integrations/supabase/client";

export function DashboardWelcome({ title, intro, cta }: { title: string; intro: string; cta: { to: "/jobs" | "/pricing"; label: string } }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("profiles").select("full_name, email, role").eq("id", u.user!.id).single();
      if (error) throw error;
      return data;
    },
  });
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isLoading ? <Skeleton className="h-9 w-64" /> : <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Bonjour {profile?.full_name.split(" ")[0]} 👋</h1>}
            <p className="mt-1 text-muted-foreground">{title}</p>
          </div>
          <Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button>
        </div>
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">{intro}</p>
          <Button asChild variant="accent" className="mt-4"><Link to={cta.to}>{cta.label}</Link></Button>
        </div>
      </div>
    </PageShell>
  );
}
