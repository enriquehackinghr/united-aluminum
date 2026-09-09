import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
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
  const service = env.UNITED_ALUMINUM_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Missing Supabase URL or service role key");

  const items = JSON.parse(await readFile(resolve(process.cwd(), "src/lib/inventory.json"), "utf8"));
  const supabase = createClient(url, service, { auth: { persistSession: false } });
  const importBatchId = randomUUID();

  const { count } = await supabase
    .from("inventory_items")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    console.log(`Inventory already has ${count} rows; skipping seed`);
    return;
  }

  const payload = items.map((item, index) => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    item_type: item.type,
    description: item.description,
    price: item.price,
    quantity: item.quantity,
    taxable: item.taxable,
    as_of: item.asOf,
    attributes: {},
    source_row: index + 2,
    import_batch_id: importBatchId,
  }));

  for (let i = 0; i < payload.length; i += 200) {
    const { error } = await supabase.from("inventory_items").insert(payload.slice(i, i + 200));
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase.from("inventory_uploads").insert({
    file_name: "inventory.json (initial snapshot)",
    row_count: payload.length,
    import_batch_id: importBatchId,
  });
  if (error) throw new Error(error.message);

  console.log(`Seeded ${payload.length} inventory items`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
