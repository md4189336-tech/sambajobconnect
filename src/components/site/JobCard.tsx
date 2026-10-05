import { Link } from "@tanstack/react-router";
import { MapPin, Briefcase, Clock, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPosted, formatSalary, getCompany, type Job } from "@/data/mock";

export function CompanyLogo({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-lg bg-secondary font-bold text-primary ${size === "lg" ? "size-16 text-xl" : "size-12"}`} aria-hidden>
      {initials}
    </div>
  );
}

export function JobCard({ job }: { job: Job }) {
  const c = getCompany(job.companyId)!;
  return (
    <article className="flex flex-col rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-accent/50">
      <div className="flex items-start gap-3">
        <CompanyLogo initials={c.initials} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">
              <Link to="/jobs/$id" params={{ id: job.id }} className="hover:text-accent">{job.title}</Link>
            </h3>
            {job.postedDaysAgo <= 1 && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Nouveau</span>}
          </div>
          <Link to="/company/$id" params={{ id: c.id }} className="text-sm text-muted-foreground hover:underline">{c.name}</Link>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="size-4" />{job.location}</span>
        <span className="flex items-center gap-1"><Briefcase className="size-4" />{job.contract}</span>
        <span className="flex items-center gap-1"><Clock className="size-4" />{formatPosted(job.postedDaysAgo)}</span>
        {job.remote && <span className="flex items-center gap-1"><Wifi className="size-4" />Télétravail</span>}
      </div>
      <p className="mt-3 font-semibold text-primary">{formatSalary(job.salaryMin, job.salaryMax)}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Compétences">
        {job.skills.map((s) => <li key={s} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{s}</li>)}
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2 pt-1">
        <Button asChild variant="outline"><Link to="/jobs/$id" params={{ id: job.id }}>Voir l'offre</Link></Button>
        <Button asChild variant="accent"><Link to="/jobs/$id" params={{ id: job.id }} hash="postuler">Postuler</Link></Button>
      </div>
    </article>
  );
}
