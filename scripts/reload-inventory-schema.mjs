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
  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SUPABASE_ACCESS_TOKEN");

  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "notify pgrst, 'reload schema'; select to_regclass('public.inventory_items') as inventory_items, to_regclass('public.inventory_uploads') as inventory_uploads;",
    }),
  });

  if (!response.ok) {
    throw new Error(`Reload failed (${response.status}): ${await response.text()}`);
  }

  console.log("Schema cache reload requested");
  console.log(JSON.stringify(await response.json()));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
