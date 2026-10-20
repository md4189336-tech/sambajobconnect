// @ts-nocheck -- temporary: schema migration in progress
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, Building2, CheckCircle2, CreditCard, Download, Eye, FileText, LogOut, RefreshCw, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type AppRole } from "@/lib/role-home";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Administration — Samba Job Connect" },
    { name: "description", content: "Tableau de bord administrateur Samba Job Connect." },
    { property: "og:title", content: "Administration — Samba Job Connect" },
    { property: "og:description", content: "Gestion des utilisateurs, paiements et documents." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  beforeLoad: async ({ context }) => {
    const user = (context as { user: { id: string } }).user;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/login" });
  },
  component: AdminPage,
});

const roleLabel: Record<AppRole, string> = { candidate: "Candidat", recruiter: "Recruteur", institution: "Institution", admin: "Admin" };
const plans = { starter: { label: "Starter", amount: 15000 }, business: { label: "Business", amount: 45000 }, premium: { label: "Premium", amount: 95000 } } as const;
const methods = { wave: "Wave", orange_money: "Orange Money", paytech: "PayTech", virement: "Virement" } as const;

type Stats = { total: number; candidates: number; recruiters: number; institutions: number; active24h: number; active7d: number; paymentsValidated: number; paymentsPending: number; revenue: number; documents: number };

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <div className="flex items-center gap-3"><Logo /><Badge variant="secondary" className="hidden gap-1 sm:inline-flex"><ShieldCheck className="size-3.5" />Admin</Badge></div>
          <Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Tableau de bord administrateur</h1>
        <p className="mt-1 text-muted-foreground">Supervisez les comptes, paiements et documents de la plateforme.</p>
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="overview" className="min-h-10">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users" className="min-h-10">Utilisateurs & paiements</TabsTrigger>
            <TabsTrigger value="applications" className="min-h-10">Candidatures</TabsTrigger>
            <TabsTrigger value="docs" className="min-h-10">Documents & CV</TabsTrigger>
            <TabsTrigger value="companies" className="min-h-10">Vérification entreprises</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="users"><UsersPanel /></TabsContent>
          <TabsContent value="applications"><ApplicationsPanel /></TabsContent>
          <TabsContent value="docs"><DocsPanel /></TabsContent>
          <TabsContent value="companies"><CompanyVerificationPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ApplicationsPanel() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data: rows, error: applicationsError } = await supabase.from("applications").select("id,job_id,candidate_id,candidate_name,candidate_email,candidate_phone,cover_letter,cv_url,status,interview_at,created_at,updated_at").order("created_at", { ascending: false });
      if (applicationsError) throw applicationsError;
      const jobIds = [...new Set(rows.map((application) => application.job_id))];
      const candidateIds = [...new Set(rows.map((application) => application.candidate_id))];
      const [jobsResult, profilesResult, candidateProfilesResult] = await Promise.all([
        jobIds.length ? supabase.from("jobs").select("id,title,recruiter_id,company_name").in("id", jobIds) : Promise.resolve({ data: [], error: null }),
        candidateIds.length ? supabase.from("profiles").select("id,full_name,email,phone").in("id", candidateIds) : Promise.resolve({ data: [], error: null }),
        candidateIds.length ? supabase.from("candidate_profiles").select("user_id,display_name,headline,location,resume_path").in("user_id", candidateIds) : Promise.resolve({ data: [], error: null }),
      ]);
      if (jobsResult.error || profilesResult.error || candidateProfilesResult.error) throw jobsResult.error ?? profilesResult.error ?? candidateProfilesResult.error;
      return rows.map((application) => {
        const profile = profilesResult.data.find((candidate) => candidate.id === application.candidate_id);
        const candidate = candidateProfilesResult.data.find((item) => item.user_id === application.candidate_id);
        return {
          ...application,
          job: jobsResult.data.find((job) => job.id === application.job_id),
          name: candidate?.display_name || profile?.full_name || application.candidate_name || "Candidat",
          email: profile?.email || application.candidate_email,
          phone: profile?.phone || application.candidate_phone,
          resume: application.cv_url || candidate?.resume_path,
        };
      });
    },
  });

  useEffect(() => {
    const channel = supabase.channel("admin-applications-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        void qc.invalidateQueries({ queryKey: ["admin-applications"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc]);

  const openResume = async (path: string) => {
    const { data, error: signedUrlError } = await supabase.storage.from("resumes").createSignedUrl(path, 300);
    if (signedUrlError || !data) { toast.error("CV indisponible ou accès non autorisé."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  const statusLabels: Record<string, string> = { pending: "En attente", viewed: "Vue", reviewed: "Examinée", shortlisted: "Présélectionnée", interview: "Entretien", accepted: "Acceptée", rejected: "Refusée" };
  const visible = applications.filter((application) => (statusFilter === "all" || application.status === statusFilter)
    && `${application.name} ${application.email} ${application.phone} ${application.job?.title ?? ""} ${application.job?.company_name ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return <section className="mt-6 space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input aria-label="Rechercher une candidature" placeholder="Candidat, e-mail ou offre" value={query} onChange={(event) => setQuery(event.target.value)} />
      <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger aria-label="Filtrer par statut" className="sm:w-56"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <Button variant="outline" size="icon" aria-label="Actualiser les candidatures" onClick={() => void qc.invalidateQueries({ queryKey: ["admin-applications"] })}><RefreshCw /></Button>
    </div>
    {isLoading ? <div role="status" className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28" />)}</div>
      : error ? <p role="alert" className="rounded-lg border p-5 text-sm text-destructive">Impossible de charger les candidatures.</p>
        : !visible.length ? <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">Aucune candidature à afficher.</p>
          : <ul className="divide-y rounded-lg border bg-card">{visible.map((application) => <li key={application.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><h3 className="font-semibold">{application.name}</h3><p className="text-sm text-muted-foreground">{[application.email, application.phone].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-sm">{application.job?.title ?? "Offre supprimée"}{application.job?.company_name ? ` · ${application.job.company_name}` : ""}</p>
              </div>
              <Badge variant={application.status === "accepted" ? "default" : application.status === "rejected" ? "destructive" : "secondary"}>{statusLabels[application.status] ?? application.status}</Badge>
            </div>
            {application.cover_letter && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.cover_letter}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">Reçue le {new Date(application.created_at).toLocaleString("fr-FR")} · mise à jour le {new Date(application.updated_at).toLocaleString("fr-FR")}</p>
              {application.resume && <Button size="sm" variant="outline" onClick={() => openResume(application.resume)}><FileText />Consulter le CV PDF</Button>}
            </div>
          </li>)}</ul>}
  </section>;
}

function CompanyVerificationPanel() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-company-verification"], queryFn: async () => {
    const { data, error } = await supabase.from("company_profiles").select("user_id,company_name,registration_number,website,country,city,description,verification_status,verification_note,updated_at").neq("verification_status", "verified").order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const decide = async (userId: string, status: "verified" | "rejected") => {
    const { error } = await supabase.rpc("admin_set_company_verification", { _target: userId, _status: status, _note: status === "rejected" ? "Dossier à compléter ou à corriger." : "" });
    if (error) { toast.error("Impossible de mettre à jour ce dossier."); return; }
    toast.success(status === "verified" ? "Entreprise vérifiée." : "Dossier refusé.");
    await qc.invalidateQueries({ queryKey: ["admin-company-verification"] });
  };
  return <section className="mt-6 space-y-4">
    <h2 className="text-xl font-bold text-primary">Dossiers de vérification</h2>
    {isLoading && <p role="status">Chargement des dossiers…</p>}
    {error && <p role="alert">Impossible de charger les dossiers de vérification.</p>}
    {!isLoading && !error && !data?.length && <p className="rounded-lg border p-5 text-sm text-muted-foreground">Aucun dossier en attente.</p>}
    {data?.map((company) => <article key={company.user_id} className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0"><h3 className="flex items-center gap-2 font-bold"><Building2 className="size-5 text-accent" />{company.company_name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{company.registration_number} · {company.city}, {company.country}</p>
          {company.website && <p className="text-sm">{company.website}</p>}
          {company.verification_note && <p className="mt-2 text-sm text-destructive">{company.verification_note}</p>}
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => decide(company.user_id, "rejected")}>Refuser</Button><Button variant="accent" onClick={() => decide(company.user_id, "verified")}><ShieldCheck />Vérifier</Button></div>
      </div>
      {company.description && <p className="mt-3 text-sm text-muted-foreground">{company.description}</p>}
    </article>)}
  </section>;
}

function useStats() {
  return useQuery({ queryKey: ["admin-stats"], queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_stats");
    if (error) throw error;
    return data as unknown as Stats;
  } });
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><span className="rounded-lg bg-accent-soft p-2 text-accent"><Icon className="size-5" /></span></div>
      <p className="mt-3 text-3xl font-extrabold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Overview() {
  const { data: s, isLoading, error, refetch } = useStats();
  if (error) return <div className="mt-6 rounded-xl border bg-card p-6 text-sm">Impossible de charger les statistiques. <Button variant="link" onClick={() => refetch()}>Réessayer</Button></div>;
  if (isLoading || !s) return <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>;
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Utilisateurs inscrits" value={s.total} sub={`${s.candidates} candidats · ${s.recruiters} recruteurs · ${s.institutions} institutions`} />
        <StatCard icon={UserCheck} label="Actifs (24 h)" value={s.active24h} sub={`${s.active7d} connectés sur 7 jours`} />
        <StatCard icon={CreditCard} label="Paiements validés" value={s.paymentsValidated} sub={`${s.paymentsPending} en attente · ${s.revenue.toLocaleString("fr-FR")} FCFA`} />
        <StatCard icon={FileText} label="CV & documents" value={s.documents} sub="Fichiers importés" />
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-bold text-primary">Répartition par rôle</h2>
        <div className="mt-4 space-y-3">
          {([["Candidats", s.candidates], ["Recruteurs", s.recruiters], ["Institutions", s.institutions]] as const).map(([l, v]) => (
            <div key={l}><div className="flex justify-between text-sm"><span>{l}</span><span className="font-semibold">{v}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${s.total ? (v / s.total) * 100 : 0}%` }} /></div></div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Les paiements Wave / Orange Money / PayTech sont simulés : aucune transaction réelle n'est traitée.</p>
      </div>
    </div>
  );
}

type Row = { id: string; full_name: string; email: string; role: AppRole; created_at: string; suspended: boolean; paid: boolean };

function UsersPanel() {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me-id"], queryFn: async () => (await supabase.auth.getUser()).data.user?.id });
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [payTarget, setPayTarget] = useState<Row | null>(null);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: async () => {
    const [{ data: profiles, error: e1 }, { data: pays, error: e2 }, { data: roles, error: e3 }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role, created_at, suspended").order("created_at", { ascending: false }),
      supabase.from("payments").select("user_id, status"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;
    const paid = new Set((pays ?? []).filter((p) => p.status === "validated").map((p) => p.user_id));
    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    return (profiles ?? []).map((p) => ({ ...p, role: (roleMap.get(p.id) ?? p.role) as AppRole, paid: paid.has(p.id) })) as Row[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); };
  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => { const { error } = await supabase.rpc("admin_set_role", { _target: id, _role: role }); if (error) throw error; },
    onSuccess: () => { toast.success("Rôle mis à jour"); refresh(); }, onError: () => toast.error("Modification du rôle impossible"),
  });
  const suspend = useMutation({
    mutationFn: async ({ id, s }: { id: string; s: boolean }) => { const { error } = await supabase.rpc("admin_set_suspended", { _target: id, _suspended: s }); if (error) throw error; },
    onSuccess: (_d, v) => { toast.success(v.s ? "Compte suspendu" : "Compte réactivé"); refresh(); }, onError: () => toast.error("Action impossible"),
  });
  const validate = useMutation({
    mutationFn: async ({ id, plan, method }: { id: string; plan: keyof typeof plans; method: string }) => {
      const { error } = await supabase.rpc("admin_validate_payment", { _target: id, _plan: plan, _amount: plans[plan].amount, _method: method }); if (error) throw error;
    },
    onSuccess: () => { toast.success("Paiement validé manuellement"); setPayTarget(null); refresh(); }, onError: () => toast.error("Validation impossible"),
  });
  const rows = useMemo(() => (data ?? []).filter((r) => (roleF === "all" || r.role === roleF) && (`${r.full_name} ${r.email}`.toLowerCase().includes(q.toLowerCase()))), [data, q, roleF]);

  return (
    <div className="mt-6 rounded-xl border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Rechercher un utilisateur" placeholder="Rechercher par nom ou email" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-9" /></div>
        <Select value={roleF} onValueChange={setRoleF}><SelectTrigger className="h-11 sm:w-48" aria-label="Filtrer par rôle"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous les rôles</SelectItem>{Object.entries(roleLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" size="icon" className="size-11" onClick={refresh} aria-label="Actualiser"><RefreshCw /></Button>
      </div>
      {error ? <p className="p-6 text-sm text-destructive">Erreur de chargement des utilisateurs.</p> : isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : rows.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé.</p> : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Rôle</TableHead><TableHead>Inscription</TableHead><TableHead>Paiement</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => {
                const self = r.id === me;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.full_name || "—"}{self && <span className="ml-1 text-xs text-muted-foreground">(vous)</span>}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>
                      <Select value={r.role} disabled={self || setRole.isPending} onValueChange={(v) => setRole.mutate({ id: r.id, role: v as AppRole })}>
                        <SelectTrigger className="h-9 w-36" aria-label={`Rôle de ${r.email}`}><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(roleLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{r.paid ? <Badge className="bg-accent text-accent-foreground">Payé</Badge> : <Badge variant="outline">Non payé</Badge>}</TableCell>
                    <TableCell>{r.suspended ? <Badge variant="destructive">Suspendu</Badge> : <Badge variant="secondary">Actif</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!r.paid && <Button size="sm" variant="outline" onClick={() => setPayTarget(r)}><CheckCircle2 />Valider paiement</Button>}
                        {!self && <Button size="sm" variant={r.suspended ? "outline" : "destructive"} disabled={suspend.isPending} onClick={() => suspend.mutate({ id: r.id, s: !r.suspended })}><Ban />{r.suspended ? "Réactiver" : "Suspendre"}</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <PayDialog target={payTarget} onClose={() => setPayTarget(null)} pending={validate.isPending} onConfirm={(plan, method) => payTarget && validate.mutate({ id: payTarget.id, plan, method })} />
    </div>
  );
}

function PayDialog({ target, onClose, onConfirm, pending }: { target: Row | null; onClose: () => void; onConfirm: (p: keyof typeof plans, m: string) => void; pending: boolean }) {
  const [plan, setPlan] = useState<keyof typeof plans>("business");
  const [method, setMethod] = useState("wave");
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Valider un paiement — {target?.full_name || target?.email}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><p className="mb-1 text-sm font-medium">Formule</p><Select value={plan} onValueChange={(v) => setPlan(v as keyof typeof plans)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(plans).map(([k, p]) => <SelectItem key={k} value={k}>{p.label} — {p.amount.toLocaleString("fr-FR")} FCFA</SelectItem>)}</SelectContent></Select></div>
          <div><p className="mb-1 text-sm font-medium">Moyen de paiement</p><Select value={method} onValueChange={setMethod}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(methods).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
          <p className="text-xs text-muted-foreground">Validation manuelle (paiement simulé, aucune transaction réelle).</p>
          <Button variant="accent" className="w-full" size="lg" disabled={pending} onClick={() => onConfirm(plan, method)}>Confirmer la validation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Doc = { path: string; size: number; mimetype: string | null; created_at: string; owner_id: string | null };

function DocsPanel() {
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<{ url: string; name: string; type: string | null } | null>(null);
  const { data: docs, isLoading, error } = useQuery({ queryKey: ["admin-docs"], queryFn: async () => {
    const [{ data, error }, { data: profiles }] = await Promise.all([supabase.rpc("admin_list_resumes"), supabase.from("profiles").select("id, full_name, email")]);
    if (error) throw error;
    const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
    return ((data ?? []) as Doc[]).map((d) => ({ ...d, owner: d.owner_id ? pm.get(d.owner_id) : undefined }));
  } });
  const sign = async (path: string, download?: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 300, download ? { download } : undefined);
    if (error || !data) { toast.error("Fichier inaccessible"); return null; }
    return data.signedUrl;
  };
  const filtered = (docs ?? []).filter((d) => `${d.path} ${d.owner?.full_name ?? ""} ${d.owner?.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mt-6 rounded-xl border bg-card shadow-card">
      <div className="border-b p-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Rechercher un document" placeholder="Rechercher par fichier, nom ou email du candidat" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-9" /></div></div>
      {error ? <p className="p-6 text-sm text-destructive">Erreur de chargement des documents.</p> : isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : filtered.length === 0 ? (
        <div className="p-10 text-center"><FileText className="mx-auto size-10 text-muted-foreground" /><p className="mt-2 font-semibold">Aucun document</p><p className="text-sm text-muted-foreground">Les CV transmis par les candidats apparaîtront ici.</p></div>
      ) : (
        <ul className="divide-y">
          {filtered.map((d) => {
            const name = d.path.split("/").pop() ?? d.path;
            return (
              <li key={d.path} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><p className="truncate font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{d.owner?.full_name || d.owner?.email || "Propriétaire inconnu"} · {(d.size / 1024).toFixed(0)} Ko · {new Date(d.created_at).toLocaleDateString("fr-FR")}</p></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { const url = await sign(d.path); if (url) setPreview({ url, name, type: d.mimetype }); }}><Eye />Aperçu</Button>
                  <Button size="sm" variant="accent" onClick={async () => { const url = await sign(d.path, name); if (url) window.location.assign(url); }}><Download />Télécharger</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle className="truncate">{preview?.name}</DialogTitle></DialogHeader>
          {preview && (preview.type?.startsWith("image/") ? <img src={preview.url} alt={preview.name} className="max-h-[75vh] w-full object-contain" /> :
            <iframe src={preview.url} title={preview.name} className="h-[75vh] w-full rounded-md border" />)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
