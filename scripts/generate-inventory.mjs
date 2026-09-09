import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import XLSX from "xlsx";

const source =
  process.argv[2] ||
  "C:/Users/erubi/OneDrive/Desktop/Inventory list 4.30.25.xlsx";
const dataDir = resolve(process.cwd(), "data");
const outJson = resolve(process.cwd(), "src/lib/inventory.json");

const SKIP_EXACT = new Set([
  "Bad Debts",
  "discount",
  "Error Correction",
  "Hours",
  "Misc. Charge",
  "Restocking fees",
  "Scrap",
]);

const CATEGORY_LABELS = {
  DIY: "Do It Yourself",
  Extrusion: "Extrusions",
  Patio: "Patio",
  "Screen/Rooms": "Screen Rooms",
  "Sheds & Shed Accessories": "Sheds & Accessories",
  "Sheet metal work": "Sheet Metal",
  "Siding & soffit": "Siding & Soffit",
  Skirting: "Skirting",
  "Window Awnings": "Window Awnings",
};

function categoryFromName(name) {
  if (!name.includes(":")) return "Other";
  const prefix = name.split(":")[0];
  return CATEGORY_LABELS[prefix] ?? prefix;
}

function displayName(name) {
  if (!name.includes(":")) return name.trim();
  return name.slice(name.indexOf(":") + 1).trim();
}

function toNumber(value) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

const workbook = XLSX.readFile(source);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
  defval: null,
  raw: true,
});

const items = [];
const usedSkus = new Set();

for (const row of rows) {
  const rawName = String(row["Product/Service Name"] ?? "").trim();
  if (!rawName || SKIP_EXACT.has(rawName) || /\*\*\*DO NOT USE\*\*\*/i.test(rawName)) {
    continue;
  }

  const skuRaw = row.SKU == null ? "" : String(row.SKU).trim();
  if (skuRaw.toUpperCase().startsWith("DNU")) continue;

  let sku = skuRaw || `UA-${items.length + 1}`;
  if (usedSkus.has(sku)) sku = `${sku}-${items.length + 1}`;
  usedSkus.add(sku);

  const name = displayName(rawName);
  const description = String(row["Sales Description"] ?? "").trim() || name;

  items.push({
    sku,
    name,
    category: categoryFromName(rawName),
    type: row.Type || "Inventory",
    description,
    price: toNumber(row["Sales Price / Rate"]),
    quantity: toNumber(row["Quantity On Hand"]) ?? 0,
    taxable: String(row.Taxable ?? "").toLowerCase() === "yes",
    asOf: row["Quantity as-of Date"] ? String(row["Quantity as-of Date"]) : "04/30/2025",
  });
}

items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

await mkdir(dataDir, { recursive: true });
await copyFile(source, resolve(dataDir, "inventory-list.xlsx"));
await writeFile(outJson, `${JSON.stringify(items, null, 2)}\n`, "utf8");

const categories = Object.fromEntries(
  [...new Set(items.map((item) => item.category))]
    .sort()
    .map((category) => [category, items.filter((item) => item.category === category).length]),
);

console.log(`Wrote ${items.length} catalog items`);
console.log(categories);
