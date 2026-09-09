import { createClient } from "@/lib/supabase/server";
import {
  inventoryCatalog,
  onlyInventoryItems,
  toCatalogItem,
  type CatalogItem,
  type InventoryUpload,
} from "./inventory";

export async function getLiveInventory(): Promise<CatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("sku, name, category, item_type, description, price, quantity, taxable, as_of")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  const items = error || !data?.length ? inventoryCatalog : data.map((row) => toCatalogItem(row));
  return onlyInventoryItems(items);
}

export async function getInventoryUpload(): Promise<InventoryUpload | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
