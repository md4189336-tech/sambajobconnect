import { Link } from "@tanstack/react-router";
import logo from "@/assets/samba-logo.jpg.asset.json";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Samba Job Connect — accueil">
      <img src={logo.url} alt="" width={40} height={40} className="size-10 rounded-md bg-card object-cover object-top" />
      <span className={`text-sm font-extrabold leading-tight tracking-tight ${light ? "text-primary-foreground" : "text-primary"}`}>
        SAMBA<br /><span className="text-accent">JOB CONNECT</span>
      </span>
    </Link>
  );
}
