import { useEffect } from "react";

export type SupabaseConnectionState =
  | { status: "connected"; sectorName: string | null }
  | { status: "error"; message: string };

export function SupabaseConnectionStatus({ connection }: { connection: SupabaseConnectionState }) {
  useEffect(() => {
    if (connection.status === "connected") {
      console.info(
        connection.sectorName
          ? `Connecté à Supabase avec succès (secteur : ${connection.sectorName}).`
          : "Connecté à Supabase avec succès (table sectors accessible, aucun secteur enregistré).",
      );
    } else {
      console.error(`Échec de connexion à Supabase : ${connection.message}`);
    }
  }, [connection]);

  const label =
    connection.status === "connected"
      ? `Connecté à Supabase${connection.sectorName ? ` · ${connection.sectorName}` : ""}`
      : `Erreur Supabase : ${connection.message}`;

  return (
    <div
      aria-live="polite"
      role={connection.status === "error" ? "alert" : "status"}
      title={connection.status === "error" ? connection.message : undefined}
      className={`fixed bottom-3 right-3 z-50 max-w-[min(28rem,calc(100vw-1.5rem))] rounded-md border px-3 py-2 text-xs shadow-lg ${
        connection.status === "connected"
          ? "border-green-300 bg-green-50 text-green-900"
          : connection.status === "error"
            ? "border-red-300 bg-red-50 text-red-900"
            : "border-border bg-background text-muted-foreground"
      }`}
    >
      {label}
    </div>
  );
}
