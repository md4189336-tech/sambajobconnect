import { Link } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DatabaseJobCard({ job, verified = false }: { job: { id: string; title: string; company_name: string; location: string; contract: string; job_title: string; company_id?: string | null; recruiter_id?: string }; verified?: boolean }) {
  return <article className="rounded-lg border bg-card p-5 shadow-card">
    <p className="flex items-center gap-1 text-sm text-muted-foreground">{job.company_name}{verified && <><BadgeCheck className="size-4 text-accent" aria-label="Entreprise vérifiée" /><span className="text-xs font-semibold text-accent">Entreprise vérifiée</span></>}</p>
    <h2 className="mt-2 text-lg font-bold text-primary"><Link to="/jobs/$id" params={{ id: job.id }}>{job.title}</Link></h2>
    <p className="mt-2 text-sm text-muted-foreground">{job.job_title}</p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-1"><MapPin className="size-4 text-accent" />{job.location}</span><span className="flex items-center gap-1"><Briefcase className="size-4 text-accent" />{job.contract}</span></div>
    <Button asChild variant="outline" className="mt-5"><Link to="/jobs/$id" params={{ id: job.id }}>Voir l'offre</Link></Button>
  </article>;
}