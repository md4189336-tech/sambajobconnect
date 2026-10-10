<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- User roles live in a separate user_roles table filled by a signup trigger; profiles.role is a read-only mirror (column not client-updatable) to prevent privilege escalation.
- Public catalogue reads use a publishable server client and TanStack Query loaders; the database is authoritative for sector and métier labels, with local icon mappings only.
- Candidate profile queries are keyed by authenticated user ID; private resumes use user-ID folders and persist their storage path in candidate_profiles so administrators can manage them.
- Published database jobs share the existing jobs list and detail URLs with demo jobs so newly published offers can be read back immediately.
