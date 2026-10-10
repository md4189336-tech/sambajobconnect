import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/contact")({
  head: () => pageMeta("Contact", "Contactez Samba Job Connect au +221 77 380 68 86, +242 06 570 74 72 ou managementaziz221@gmail.com."),
  component: () => <PageShell><section className="mx-auto max-w-4xl px-4 py-16 lg:px-8"><p className="text-sm font-semibold text-accent">Samba Job Connect</p><h1 className="mt-3 text-3xl font-extrabold text-primary">Contact</h1><p className="mt-4 text-muted-foreground">Une question, un recrutement ou un partenariat ? Contactez notre équipe.</p>
    <div className="mt-10 grid gap-8 border-y py-8 sm:grid-cols-2"><div><Phone className="size-7 text-accent" /><h2 className="mt-4 text-lg font-bold">Téléphones</h2><a className="mt-3 flex min-h-11 items-center hover:text-accent" href="tel:+221773806886">+221 77 380 68 86</a><a className="flex min-h-11 items-center hover:text-accent" href="tel:+242065707472">+242 06 570 74 72</a></div><div><Mail className="size-7 text-accent" /><h2 className="mt-4 text-lg font-bold">Email</h2><a className="mt-3 flex min-h-11 items-center break-all text-sm hover:text-accent" href="mailto:managementaziz221@gmail.com">managementaziz221@gmail.com</a></div></div>
  </section></PageShell>,
});