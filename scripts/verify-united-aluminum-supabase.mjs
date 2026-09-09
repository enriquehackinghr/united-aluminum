import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const PROJECT_REF = "uasqjcymouarsfckcxtx";

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
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "UNITED_ALUMINUM_SUPABASE_PROJECT_REF",
    "UNITED_ALUMINUM_SUPABASE_SERVICE_ROLE_KEY",
  ];

  for (const key of required) {
    console.log(`${key}: ${env[key] ? "present" : "MISSING"}`);
  }

  if (env.NEXT_PUBLIC_SUPABASE_URL !== `https://${PROJECT_REF}.supabase.co`) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL does not point at united-aluminum");
  }

  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SUPABASE_ACCESS_TOKEN");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const queryResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `
          select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
          from pg_class c
          join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'profiles';

          select policyname, cmd
          from pg_policies
          where schemaname = 'public' and tablename = 'profiles'
          order by policyname;
        `,
      }),
    },
  );

  if (!queryResponse.ok) {
    throw new Error(`Schema verify failed (${queryResponse.status})`);
  }

  const rows = await queryResponse.json();
  console.log("Schema verify:", JSON.stringify(rows));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
