import Link from "next/link";
import { ArrowRight, Boxes, CircleAlert, Layers3, PackageCheck } from "lucide-react";
import { requireAccount } from "@/lib/account";
import {
  formatPrice,
  formatQuantity,
  getCategories,
  getInventoryStats,
} from "@/lib/inventory";
import { getLiveInventory } from "@/lib/inventory-server";
import { Button } from "@/components/Button";

export default async function AccountOverviewPage() {
  const { displayName, profile, user } = await requireAccount();
  const firstName = displayName.split(" ")[0];
  const inventoryCatalog = await getLiveInventory();
  const inventoryStats = getInventoryStats(inventoryCatalog);
  const featured = inventoryCatalog
    .filter((item) => item.quantity > 0 && (item.price ?? 0) > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  const categoryCounts = getCategories(inventoryCatalog).map((category) => ({
    category,
    count: inventoryCatalog.filter((item) => item.category === category).length,
  }));

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-navy-950 px-6 py-7 text-white md:px-8">
        <div className="arizona-stripe -mx-6 mb-6 md:-mx-8" aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-widest text-arizona-gold">
          Customer dashboard
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Welcome back, {firstName}</h1>
            <p className="mt-2 max-w-xl text-mist-200">
              Browse live inventory, check stock, and send a quote request for sheds, patio, and building products.
            </p>
          </div>
          <Button href="/account/inventory" size="sm">
            Open catalog
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Catalog items", value: inventoryStats.total, icon: Boxes },
          { label: "In stock", value: inventoryStats.inStock, icon: PackageCheck },
          { label: "Low stock", value: inventoryStats.lowStock, icon: CircleAlert },
          { label: "Categories", value: inventoryStats.categories, icon: Layers3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-navy-500">{stat.label}</p>
                <Icon className="h-4 w-4 text-arizona-copper" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-navy-950">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-navy-950">High-stock items</h2>
              <p className="mt-1 text-sm text-navy-600">Ready to quote from the live inventory catalog.</p>
            </div>
            <Link href="/account/inventory" className="text-sm font-semibold text-navy-800 hover:text-navy-600">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-sand-100">
            {featured.map((item) => (
              <div key={item.sku} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-900">{item.name}</p>
                  <p className="text-xs text-navy-500">
                    {item.category} · SKU {item.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-navy-900">{formatPrice(item.price)}</p>
                  <p className="text-xs text-sage-500">{formatQuantity(item.quantity, null)} on hand</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold text-navy-950">Your account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Name</dt>
                <dd className="font-medium text-navy-900">{profile?.full_name || displayName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Email</dt>
                <dd className="font-medium text-navy-900">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Phone</dt>
                <dd className="font-medium text-navy-900">{profile?.phone || "Add in Account"}</dd>
              </div>
            </dl>
            <Link
              href="/account/settings"
              className="mt-5 inline-flex text-sm font-semibold text-navy-800 hover:text-navy-600"
            >
              Manage account →
            </Link>
          </section>

          <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold text-navy-950">Browse by category</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryCounts.map((item) => (
                <Link
                  key={item.category}
                  href={`/account/inventory?category=${encodeURIComponent(item.category)}`}
                  className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-navy-600/20 hover:bg-white"
                >
                  {item.category} ({item.count})
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
