import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";

const PROJECT_REF = "uasqjcymouarsfckcxtx";
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;
const ROOT = resolve(process.cwd());
const ENV_PATH = resolve(ROOT, ".env.local");
const SCHEMA_PATH = resolve(ROOT, "supabase/schema.sql");
const PASS_PATH = resolve(ROOT, ".ua-db-pass.tmp");

function parseEnv(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function upsertEnvBlock(contents, entries) {
  const begin = "# --- United Aluminum (dedicated project) ---";
  const end = "# --- End United Aluminum ---";
  const block = [
    begin,
    ...Object.entries(entries).map(([key, value]) => `${key}=${value}`),
    end,
    "",
  ].join("\n");

  if (contents.includes(begin) && contents.includes(end)) {
    const start = contents.indexOf(begin);
    const stop = contents.indexOf(end) + end.length;
    return `${contents.slice(0, start).replace(/\s*$/, "\n\n")}${block}${contents.slice(stop).replace(/^\s*/, "\n")}`;
  }

  return `${contents.replace(/\s*$/, "\n\n")}${block}`;
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing SUPABASE_ACCESS_TOKEN");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const keysResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`,
    { headers },
  );
  if (!keysResponse.ok) {
    throw new Error(`Failed to fetch API keys (${keysResponse.status})`);
  }

  const keys = await keysResponse.json();
  const anon =
    keys.find((key) => key.name === "anon" || key.type === "legacy" && key.name?.includes("anon"))?.api_key ??
    keys.find((key) => key.type === "publishable")?.api_key;
  const service =
    keys.find((key) => key.name === "service_role")?.api_key ??
    keys.find((key) => key.type === "secret")?.api_key;

  if (!anon || !service) {
    const names = keys.map((key) => `${key.name}:${key.type}`).join(", ");
    throw new Error(`Could not map API keys from: ${names}`);
  }

  let dbPassword = "";
  try {
    dbPassword = (await readFile(PASS_PATH, "utf8")).trim();
  } catch {
    dbPassword = "";
  }

  const encodedPassword = dbPassword ? encodeURIComponent(dbPassword) : "";
  const dbUrl = encodedPassword
    ? `postgresql://postgres.${PROJECT_REF}:${encodedPassword}@aws-0-us-west-2.pooler.supabase.com:5432/postgres`
    : "";

  const currentEnv = await readFile(ENV_PATH, "utf8");
  const nextEnv = upsertEnvBlock(currentEnv, {
    NEXT_PUBLIC_SUPABASE_URL: PROJECT_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anon,
    UNITED_ALUMINUM_SUPABASE_PROJECT_REF: PROJECT_REF,
    UNITED_ALUMINUM_SUPABASE_SERVICE_ROLE_KEY: service,
    ...(dbUrl ? { UNITED_ALUMINUM_SUPABASE_DB_URL: dbUrl } : {}),
  });
  await writeFile(ENV_PATH, nextEnv, "utf8");
  console.log("Wrote United Aluminum keys to .env.local");

  const schema = await readFile(SCHEMA_PATH, "utf8");
  const queryResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query: schema }),
    },
  );
  if (!queryResponse.ok) {
    const body = await queryResponse.text();
    throw new Error(`Schema apply failed (${queryResponse.status}): ${body}`);
  }
  console.log("Applied customer profiles schema");

  const authResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        site_url: "http://localhost:3003",
        uri_allow_list:
          "http://localhost:3003,http://localhost:3003/**,http://127.0.0.1:3003,http://127.0.0.1:3003/**",
        disable_signup: false,
        mailer_autoconfirm: true,
      }),
    },
  );
  if (!authResponse.ok) {
    const body = await authResponse.text();
    throw new Error(`Auth config update failed (${authResponse.status}): ${body}`);
  }
  console.log("Configured email signup without confirmation emails");

  try {
    await unlink(PASS_PATH);
  } catch {
    // already removed
  }

  const advisorsResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/advisors/security`,
    { headers },
  );
  if (advisorsResponse.ok) {
    const advisors = await advisorsResponse.json();
    const lints = Array.isArray(advisors) ? advisors : advisors.lints ?? advisors.data ?? [];
    const relevant = (Array.isArray(lints) ? lints : []).filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      return text.includes("profile") || text.includes("rls") || text.includes("auth");
    });
    console.log(`Security advisors returned ${Array.isArray(lints) ? lints.length : 0} item(s)`);
    if (relevant.length) {
      console.log("Relevant advisor titles:");
      for (const item of relevant.slice(0, 8)) {
        console.log(`- ${item.title || item.name || item.level || "advisor"}`);
      }
    }
  } else {
    console.log(`Security advisors unavailable (${advisorsResponse.status})`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
