import { useId } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/lib/catalog";

export function SectorJobSelect({ sector, jobTitle, onSectorChange, onJobTitleChange, required = false }: {
  sector: string; jobTitle: string; onSectorChange: (value: string) => void;
  onJobTitleChange: (value: string) => void; required?: boolean;
}) {
  const { data } = useSuspenseQuery(catalogOptions);
  const id = useId();
  const titles = data.titles.filter((title) => title.sector_slug === sector);
  return <div className="grid gap-4 sm:grid-cols-2">
    <div><label htmlFor={`${id}-sector`} className="mb-2 block text-sm font-semibold">Secteur</label>
      <select id={`${id}-sector`} name="sector" required={required} value={sector} onChange={(e) => { onSectorChange(e.target.value); onJobTitleChange(""); }} className="h-12 w-full min-w-0 rounded-md border bg-card px-3 text-sm">
        <option value="">{required ? "Choisir un secteur" : "Tous les secteurs"}</option>
        {data.sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select></div>
    <div><label htmlFor={`${id}-job`} className="mb-2 block text-sm font-semibold">Métier</label>
      <select id={`${id}-job`} name="job_title" required={required} disabled={!sector} value={jobTitle} onChange={(e) => onJobTitleChange(e.target.value)} className="h-12 w-full min-w-0 rounded-md border bg-card px-3 text-sm disabled:opacity-60">
        <option value="">{required ? "Choisir un métier" : "Tous les métiers"}</option>
        {titles.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
      </select></div>
  </div>;
}