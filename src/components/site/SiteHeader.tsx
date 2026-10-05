import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";

export const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/jobs", label: "Emplois" },
  { to: "/companies", label: "Entreprises" },
  { to: "/institutions", label: "Formations" },
  { to: "/pricing", label: "Tarifs" },
  { to: "/about", label: "À propos" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary font-semibold" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost"><Link to="/login">Se connecter</Link></Button>
          <Button asChild variant="accent"><Link to="/register">Créer un compte</Link></Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Ouvrir le menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Navigation mobile">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: l.to === "/" }}
                  className="flex min-h-11 items-center rounded-md px-3 font-medium hover:bg-muted"
                  activeProps={{ className: "text-accent" }}>{l.label}</Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild variant="outline" size="lg"><Link to="/login" onClick={() => setOpen(false)}>Se connecter</Link></Button>
              <Button asChild variant="accent" size="lg"><Link to="/register" onClick={() => setOpen(false)}>Créer un compte</Link></Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
