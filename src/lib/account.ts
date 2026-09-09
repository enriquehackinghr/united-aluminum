import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAccount() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ||
    user.email ||
    "Customer";

  return { user, profile, displayName };
}
