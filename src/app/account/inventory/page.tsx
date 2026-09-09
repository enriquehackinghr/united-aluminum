import type { Metadata } from "next";
import { InventoryCatalog } from "@/components/dashboard/InventoryCatalog";
import { requireAccount } from "@/lib/account";
import { getInventoryStats } from "@/lib/inventory";
import { getLiveInventory } from "@/lib/inventory-server";

export const metadata: Metadata = {
  title: "Inventory Catalog",
  description: "Browse United Aluminum inventory by category, check prices, and add items to your cart.",
};

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAccount();
  const params = await searchParams;
  const items = await getLiveInventory();
  const stats = getInventoryStats(items);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-arizona-copper">
          Product catalog
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-950">Inventory</h1>
        <p className="mt-2 max-w-2xl text-navy-600">
          {stats.total} items in the live United Aluminum catalog, organized by category.
          Choose a quantity and add products to your cart. Matching SKUs are combined automatically.
        </p>
      </div>
      <InventoryCatalog items={items} initialCategory={params.category} initialQuery={params.q} />
    </div>
  );
}
