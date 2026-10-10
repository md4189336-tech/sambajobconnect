import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Layers } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/lib/catalog";

export function JobSearchBar({ initial = {} }: { initial?: { q?: string | undefined; location?: string | undefined; sector?: string | undefined } }) {
  const { data: { sectors } } = useSuspenseQuery(catalogOptions);
  const navigate = useNavigate();
  const [q, setQ] = useState(initial.q ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [sector, setSector] = useState(initial.sector ?? "");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/jobs", search: { q: q || undefined, location: location || undefined, sector: sector || undefined } });
  };
  const field = "flex min-h-12 items-center gap-2 rounded-lg border bg-card px-3 focus-within:border-accent";
  return (
    <form onSubmit={submit} role="search" className="grid gap-2 rounded-xl border bg-card p-2 shadow-card md:grid-cols-[1.4fr_1fr_1fr_auto]">
      <label className={field}>
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Que recherchez-vous ?</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex : Développeur, Comptable, Commercial..." className="w-full bg-transparent text-sm outline-none" />
      </label>
      <label className={field}>
        <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Où ?</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dakar, Kolda, Ziguinchor..." className="w-full bg-transparent text-sm outline-none" />
      </label>
      <label className={field}>
        <Layers className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Secteur</span>
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="w-full bg-transparent text-sm outline-none">
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </label>
      <Button type="submit" variant="accent" size="lg" className="w-full md:w-auto">Rechercher un emploi</Button>
    </form>
  );
}
