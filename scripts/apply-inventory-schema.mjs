import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const PROJECT_REF = "uasqjcymouarsfckcxtx";
const MARKER = "-- Admin inventory (allowlist is enforced in RLS + the Next.js app)";

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
  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SUPABASE_ACCESS_TOKEN");

  const schema = await readFile(resolve(process.cwd(), "supabase/schema.sql"), "utf8");
  const start = schema.indexOf(MARKER);
  if (start === -1) throw new Error("Inventory schema block not found");
  const query = schema.slice(start);

  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Inventory schema apply failed (${response.status}): ${body}`);
  }

  const verify = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('inventory_items', 'inventory_uploads')
        order by c.relname;

        notify pgrst, 'reload schema';

        select tablename, policyname, cmd
        from pg_policies
        where schemaname = 'public' and tablename in ('inventory_items', 'inventory_uploads')
        order by tablename, policyname;
      `,
    }),
  });

  if (!verify.ok) {
    throw new Error(`Inventory schema verify failed (${verify.status})`);
  }

  console.log("Inventory schema applied");
  console.log(JSON.stringify(await verify.json()));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
