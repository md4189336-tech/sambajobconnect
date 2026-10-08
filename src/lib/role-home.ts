export type AppRole = "candidate" | "recruiter" | "institution" | "admin";

export function roleHome(role: AppRole | null | undefined): "/admin" | "/recruiter" | "/institutions" | "/candidate" {
  if (role === "admin") return "/admin";
  if (role === "recruiter") return "/recruiter";
  if (role === "institution") return "/institutions";
  return "/candidate";
}
