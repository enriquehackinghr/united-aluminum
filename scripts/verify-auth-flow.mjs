import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseEnv(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

async function main() {
  const env = parseEnv(await readFile(resolve(process.cwd(), ".env.local"), "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing public Supabase env");

  const supabase = createClient(url, key);
  const email = `ua.auth.verify.${Date.now()}@example.com`;
  const password = `UA_Verify_${Date.now()}!`;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Verify User",
        phone: "(602) 555-0100",
      },
    },
  });

  if (signUpError) throw new Error(`Signup failed: ${signUpError.message}`);
  console.log(`Signup ok; session=${Boolean(signUpData.session)} user=${Boolean(signUpData.user)}`);

  if (!signUpData.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error(`Sign-in failed: ${signInError.message}`);
    console.log("Sign-in ok after signup without session");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .maybeSingle();

  if (profileError) throw new Error(`Profile read failed: ${profileError.message}`);
  console.log(`Profile full_name=${profile?.full_name ?? "missing"} phone=${profile?.phone ? "present" : "missing"}`);

  await supabase.auth.signOut();
  console.log("Sign-out ok");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
