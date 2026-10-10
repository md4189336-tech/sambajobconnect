import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const candidateOptions = (userId: string) => queryOptions({
  queryKey: ["candidate-profile", userId],
  queryFn: async () => {
    const [candidate, profile] = await Promise.all([
      supabase.from("candidate_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
    ]);
    if (candidate.error || profile.error) throw new Error("Impossible de charger votre profil.");
    return { candidate: candidate.data, name: profile.data.full_name };
  },
});