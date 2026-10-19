export type AppRole = "candidate" | "company" | "recruiter" | "institution" | "admin";

export function roleHome(role: AppRole | null | undefined): "/admin" | "/recruiter" | "/institutions" | "/candidate" {
  if (role === "admin") return "/admin";
  if (role === "recruiter" || role === "company") return "/recruiter";
  if (role === "institution") return "/institutions";
  return "/candidate";
}
