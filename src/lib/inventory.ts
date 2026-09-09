import inventoryJson from "./inventory.json";

export type CatalogItem = {
  sku: string;
  name: string;
  category: string;
  type: string;
  description: string;
  price: number | null;
  quantity: number;
  taxable: boolean;
  asOf: string | null;
};

export type StockStatus = "in-stock" | "low" | "out";

export type InventoryUpload = {
  id: string;
  file_name: string;
  row_count: number;
  import_batch_id: string;
  uploaded_by: string | null;
  created_at: string;
};

export type InventoryRecord = CatalogItem & {
  id: string;
  attributes: Record<string, string>;
  source_row: number | null;
  import_batch_id: string;
};

export type ParsedInventoryRow = CatalogItem & {
  attributes: Record<string, string>;
  source_row: number;
};

export const inventoryCatalog = inventoryJson as CatalogItem[];

export const MAX_INVENTORY_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_INVENTORY_ROWS = 10_000;

const SKIP_EXACT = new Set([
  "bad debts",
  "discount",
  "error correction",
  "hours",
  "misc. charge",
  "restocking fees",
  "scrap",
]);

const CATEGORY_LABELS: Record<string, string> = {
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

const HEADER_ALIASES: Record<string, keyof ParsedInventoryRow | "rawName"> = {
  sku: "sku",
  "item sku": "sku",
  "item #": "sku",
  "item number": "sku",
  "item no": "sku",
  "part number": "sku",
  "part #": "sku",
  part: "sku",
  code: "sku",
  "product code": "sku",
  name: "name",
  item: "name",
  "item name": "name",
  product: "name",
  "product name": "name",
  title: "name",
  "product service name": "rawName",
  category: "category",
  group: "category",
  line: "category",
  type: "type",
  "product type": "type",
  "item type": "type",
  description: "description",
  details: "description",
  notes: "description",
  "sales description": "description",
  quantity: "quantity",
  qty: "quantity",
  stock: "quantity",
  "on hand": "quantity",
  "quantity on hand": "quantity",
  "qty on hand": "quantity",
  inventory: "quantity",
  price: "price",
  "unit price": "price",
  "sales price": "price",
  "sales price rate": "price",
  cost: "price",
  taxable: "taxable",
  tax: "taxable",
  "as of": "asOf",
  asof: "asOf",
  "quantity as of date": "asOf",
  "as of date": "asOf",
};

export function getCategories(items: CatalogItem[]) {
  return [...new Set(items.map((item) => item.category))].sort();
}

export function getInventoryStats(items: CatalogItem[]) {
  const categories = getCategories(items);
  return {
    total: items.length,
    inStock: items.filter((item) => item.quantity > 0).length,
    lowStock: items.filter((item) => item.quantity > 0 && item.quantity < 10).length,
    categories: categories.length,
  };
}

export const inventoryCategories = getCategories(inventoryCatalog);
export const inventoryStats = getInventoryStats(inventoryCatalog);

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity < 10) return "low";
  return "in-stock";
}

export function formatPrice(price: number | null) {
  if (price == null || price <= 0) return "Call for price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatQuantity(value: number | null, unit: string | null = null) {
  if (value == null) return "—";
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  return unit ? `${amount} ${unit}` : amount;
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_/#]+/g, " ")
    .replace(/\s+/g, " ");
}

function excelSerialToDate(value: number) {
  const epoch = Date.UTC(1899, 11, 30);
  return new Date(epoch + value * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function asText(value: unknown) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function asDateText(value: unknown) {
  if (typeof value === "number" && value > 20000 && value < 80000) {
    return excelSerialToDate(value);
  }
  return asText(value);
}

function asNumber(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function asBoolean(value: unknown) {
  const text = asText(value)?.toLowerCase();
  if (!text) return false;
  return text === "yes" || text === "true" || text === "1" || text === "y";
}

function categoryFromName(name: string) {
  if (!name.includes(":")) return "Other";
  const prefix = name.split(":")[0];
  return CATEGORY_LABELS[prefix] ?? prefix;
}

function displayName(name: string) {
  if (!name.includes(":")) return name.trim();
  return name.slice(name.indexOf(":") + 1).trim();
}

export function toCatalogItem(row: {
  sku?: string | null;
  name?: string | null;
  category?: string | null;
  item_type?: string | null;
  type?: string | null;
  description?: string | null;
  price?: number | string | null;
  quantity?: number | string | null;
  taxable?: boolean | null;
  as_of?: string | null;
  asOf?: string | null;
}): CatalogItem {
  return {
    sku: row.sku?.trim() || "—",
    name: row.name?.trim() || "Untitled item",
    category: row.category?.trim() || "Other",
    type: (row.item_type ?? row.type)?.trim() || "Inventory",
    description: row.description?.trim() || row.name?.trim() || "Untitled item",
    price: asNumber(row.price),
    quantity: asNumber(row.quantity) ?? 0,
    taxable: Boolean(row.taxable),
    asOf: row.as_of ?? row.asOf ?? null,
  };
}

export function parseInventorySheet(rows: unknown[][]) {
  if (!rows.length) {
    throw new Error("The spreadsheet is empty.");
  }

  const headerRow = rows[0] ?? [];
  const headers = headerRow.map((cell) => asText(cell) ?? "");
  if (!headers.some(Boolean)) {
    throw new Error("The first row must contain column headers.");
  }

  const mapped = headers.map((header) => HEADER_ALIASES[normalizeHeader(header)] ?? null);
  const isQuickBooks = mapped.includes("rawName");
  const extraIndexes = headers
    .map((header, index) => ({ header, index, mapped: mapped[index] }))
    .filter((col) => col.header && !col.mapped);

  const items: ParsedInventoryRow[] = [];
  const usedSkus = new Set<string>();

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const isEmpty = row.every((cell) => asText(cell) == null);
    if (isEmpty) continue;

    const record: ParsedInventoryRow = {
      sku: "",
      name: "",
      category: "Other",
      type: "Inventory",
      description: "",
      price: null,
      quantity: 0,
      taxable: false,
      asOf: null,
      attributes: {},
      source_row: i + 1,
    };

    let rawName: string | null = null;

    headers.forEach((header, index) => {
      const field = mapped[index];
      const value = row[index];
      if (!field) {
        const text = asText(value);
        if (header && text) record.attributes[header] = text;
        return;
      }

      if (field === "rawName") {
        rawName = asText(value);
        return;
      }

      if (field === "attributes" || field === "source_row") return;

      if (field === "price") {
        record.price = asNumber(value);
        return;
      }

      if (field === "quantity") {
        record.quantity = asNumber(value) ?? 0;
        return;
      }

      if (field === "taxable") {
        record.taxable = asBoolean(value);
        return;
      }

      if (field === "asOf") {
        record.asOf = asDateText(value);
        return;
      }

      const text = asText(value);
      if (text) record[field] = text;
    });

    extraIndexes.forEach(({ header, index }) => {
      const text = asText(row[index]);
      if (text) record.attributes[header] = text;
    });

    const sourceName = rawName ?? record.name;
    if (isQuickBooks && sourceName) {
      if (SKIP_EXACT.has(sourceName.toLowerCase()) || /\*\*\*do not use\*\*\*/i.test(sourceName)) {
        continue;
      }
      if (record.sku.toUpperCase().startsWith("DNU")) continue;
      if (!record.category || record.category === "Other") {
        record.category = categoryFromName(sourceName);
      }
      record.name = displayName(sourceName);
    }

    if (!record.name) {
      record.name = record.sku || `Untitled item (row ${record.source_row})`;
    }
    if (!record.description) record.description = record.name;
    if (!record.sku) record.sku = `UA-${items.length + 1}`;
    if (usedSkus.has(record.sku)) record.sku = `${record.sku}-${items.length + 1}`;
    usedSkus.add(record.sku);

    items.push(record);
  }

  if (!items.length) {
    throw new Error("No inventory rows were found under the header row.");
  }

  if (items.length > MAX_INVENTORY_ROWS) {
    throw new Error(`Spreadsheets are limited to ${MAX_INVENTORY_ROWS.toLocaleString()} rows.`);
  }

  return items;
}
