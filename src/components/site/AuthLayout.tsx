import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-extrabold text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function Field({ id, label, error, ...props }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        className="h-11 w-full rounded-md border bg-card px-3 text-sm outline-none focus:border-accent aria-[invalid=true]:border-destructive" {...props} />
      {error && <p id={`${id}-err`} className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
