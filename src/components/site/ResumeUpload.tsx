import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function ResumeUpload({ userId, resumePath }: { userId: string; resumePath?: string | null | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const upload = async (file?: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "doc", "docx"].includes(ext)) { toast.error("Choisissez un CV au format PDF, DOC ou DOCX."); return; }
    if (file.size > 10 * 1024 * 1024 || file.size === 0) { toast.error("Le fichier doit contenir entre 1 octet et 10 Mo."); return; }
    setBusy(true);
    const safeName = file.name.normalize("NFD").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
    try {
      const { error } = await supabase.storage.from("resumes").upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (error) throw error;
      const saved = await supabase.from("candidate_profiles").upsert({ user_id: userId, resume_path: path, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (saved.error) { await supabase.storage.from("resumes").remove([path]); throw saved.error; }
      if (resumePath) await supabase.storage.from("resumes").remove([resumePath]);
      await qc.invalidateQueries({ queryKey: ["candidate-profile", userId] });
      await qc.invalidateQueries({ queryKey: ["admin-resumes"] });
      toast.success("CV importé avec succès !");
    } catch { toast.error("L'importation du CV a échoué. Réessayez."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };
  const download = async () => {
    if (!resumePath) return;
    const { data, error } = await supabase.storage.from("resumes").download(resumePath);
    if (error) { toast.error("Impossible de télécharger votre CV."); return; }
    const url = URL.createObjectURL(data); const a = document.createElement("a");
    a.href = url; a.download = resumePath.split("/").pop()?.replace(/^[a-f0-9-]{36}-/, "") || "CV"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="border-y py-8">
    <div className="flex items-center gap-3"><FileText className="size-7 text-accent" /><h2 className="text-xl font-bold text-primary">Mon CV</h2></div>
    <p className="mt-3 break-words text-sm text-muted-foreground">{resumePath ? resumePath.split("/").pop()?.replace(/^[a-f0-9-]{36}-/, "") : "Aucun CV importé"}</p>
    <p className="mt-1 text-xs text-muted-foreground">PDF, DOC ou DOCX · 10 Mo maximum · Document privé</p>
    <input ref={input} type="file" accept=".pdf,.doc,.docx" aria-label="Choisir un CV" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
    <div className="mt-5 flex flex-wrap gap-3">
      <Button variant="accent" size="lg" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <Upload />}{busy ? "Importation…" : resumePath ? "Remplacer mon CV" : "Importer mon CV"}</Button>
      {resumePath && <Button variant="outline" size="lg" onClick={download}><Download />Télécharger</Button>}
    </div>
  </section>;
}