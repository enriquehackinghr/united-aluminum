"use client";

import { useMemo, useState } from "react";
import { Check, PackageSearch, Search, ShoppingCart } from "lucide-react";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import {
  formatPrice,
  formatQuantity,
  getCategories,
  getStockStatus,
  isAvailableToOrder,
  type CatalogItem,
  type StockStatus,
} from "@/lib/inventory";

const PAGE_SIZE = 20;

const stockFilters: { id: "all" | StockStatus; label: string }[] = [
  { id: "all", label: "All items" },
  { id: "in-stock", label: "In stock" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
];

function StockBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity);
  const styles = {
    "in-stock": "bg-sage-400/15 text-sage-500",
    low: "bg-arizona-gold/20 text-navy-800",
    out: "bg-arizona-red/10 text-arizona-red",
  }[status];
  const label = {
    "in-stock": "In stock",
    low: "Low stock",
    out: quantity < 0 ? "Backordered" : "Out of stock",
  }[status];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}

export function InventoryCatalog({
  items,
  initialCategory,
  initialQuery,
}: {
  items: CatalogItem[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const { addItem } = useCart();
  const inventoryCategories = getCategories(items);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState(
    initialCategory && inventoryCategories.includes(initialCategory) ? initialCategory : "all",
  );
  const [stock, setStock] = useState<"all" | StockStatus>("all");
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedSku, setAddedSku] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchesQuery =
          !needle ||
          item.name.toLowerCase().includes(needle) ||
          item.sku.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle) ||
          item.category.toLowerCase().includes(needle);
        const matchesCategory = category === "all" || item.category === category;
        const matchesStock = stock === "all" || getStockStatus(item.quantity) === stock;
        return matchesQuery && matchesCategory && matchesStock;
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [items, query, category, stock]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of filtered) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return counts;
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function quantityFor(sku: string) {
    return quantities[sku] ?? 1;
  }

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function addToCart(item: CatalogItem) {
    if (!isAvailableToOrder(item.quantity)) return;
    const quantity = quantityFor(item.sku);
    addItem(
      {
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: item.price,
      },
      quantity,
    );
    setAddedSku(item.sku);
    window.setTimeout(() => {
      setAddedSku((current) => (current === item.sku ? null : current));
    }, 1800);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateFilter(setQuery, event.target.value)}
              placeholder="Search by name, SKU, category, or description"
              className="w-full rounded-xl border border-sand-200 bg-sand-50 py-3 pl-10 pr-4 text-sm text-navy-900 outline-none focus:border-navy-600 focus:bg-white focus:ring-2 focus:ring-navy-600/20"
            />
          </label>
          <select
            value={category}
            onChange={(event) => updateFilter(setCategory, event.target.value)}
            className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-600 focus:bg-white focus:ring-2 focus:ring-navy-600/20"
          >
            <option value="all">All categories</option>
            {inventoryCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {stockFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => updateFilter(setStock, filter.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                stock === filter.id
                  ? "bg-navy-950 text-white"
                  : "bg-sand-100 text-navy-700 hover:bg-sand-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-navy-600">
        <p>
          Showing{" "}
          <span className="font-semibold text-navy-900">
            {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of <span className="font-semibold text-navy-900">{filtered.length}</span> items
          {category === "all" ? ", grouped by category" : ""}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-navy-300" />
          <p className="mt-3 font-display text-lg font-bold text-navy-900">No matching items</p>
          <p className="mt-1 text-sm text-navy-600">Try a different search or clear the filters.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {visible.map((item, index) => {
              const showHeader = index === 0 || visible[index - 1].category !== item.category;
              return (
                <div key={item.sku} className="space-y-3">
                  {showHeader && (
                    <div className="flex items-center justify-between px-1 pt-2">
                      <h2 className="font-display text-lg font-bold text-navy-950">{item.category}</h2>
                      <p className="text-xs font-semibold text-navy-500">
                        {categoryCounts.get(item.category) ?? 0} items
                      </p>
                    </div>
                  )}
                  <article className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-navy-900">{item.name}</h3>
                        <p className="mt-1 text-xs text-navy-500">SKU {item.sku}</p>
                      </div>
                      <StockBadge quantity={item.quantity} />
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy-900">{formatPrice(item.price)}</p>
                        <p className="text-xs text-navy-500">
                          {formatQuantity(item.quantity, null)} on hand
                        </p>
                      </div>
                      <QuantityStepper
                        size="sm"
                        value={quantityFor(item.sku)}
                        disabled={!isAvailableToOrder(item.quantity)}
                        onChange={(value) =>
                          setQuantities((current) => ({ ...current, [item.sku]: value }))
                        }
                        ariaLabel={`Quantity for ${item.name}`}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!isAvailableToOrder(item.quantity)}
                      onClick={() => addToCart(item)}
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                        isAvailableToOrder(item.quantity)
                          ? "bg-arizona-gold text-navy-900"
                          : "cursor-not-allowed bg-sand-200 text-navy-400"
                      }`}
                    >
                      {addedSku === item.sku ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Added to cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {isAvailableToOrder(item.quantity) ? "Add to cart" : "Out of stock"}
                        </>
                      )}
                    </button>
                  </article>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy-950 text-xs uppercase tracking-wider text-mist-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">On hand</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item, index) => {
                  const showHeader = index === 0 || visible[index - 1].category !== item.category;
                  return (
                    <CatalogRow
                      key={item.sku}
                      item={item}
                      showHeader={showHeader}
                      categoryCount={categoryCounts.get(item.category) ?? 0}
                      quantity={quantityFor(item.sku)}
                      added={addedSku === item.sku}
                      onQuantityChange={(value) =>
                        setQuantities((current) => ({ ...current, [item.sku]: value }))
                      }
                      onAdd={() => addToCart(item)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-navy-800 disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-navy-600">
            Page {currentPage} of {pageCount}
          </p>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-navy-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function CatalogRow({
  item,
  showHeader,
  categoryCount,
  quantity,
  added,
  onQuantityChange,
  onAdd,
}: {
  item: CatalogItem;
  showHeader: boolean;
  categoryCount: number;
  quantity: number;
  added: boolean;
  onQuantityChange: (value: number) => void;
  onAdd: () => void;
}) {
  const available = isAvailableToOrder(item.quantity);
  return (
    <>
      {showHeader && (
        <tr className="border-t border-sand-200 bg-sand-100">
          <td colSpan={7} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-sm font-bold text-navy-950">{item.category}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {categoryCount} items
              </p>
            </div>
          </td>
        </tr>
      )}
      <tr className="border-t border-sand-100 hover:bg-sand-50/80">
        <td className="px-4 py-3">
          <p className="font-medium text-navy-900">{item.name}</p>
          {item.description !== item.name && (
            <p className="mt-0.5 max-w-md truncate text-xs text-navy-500">{item.description}</p>
          )}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-navy-600">{item.sku}</td>
        <td className="px-4 py-3 font-semibold text-navy-900">{formatPrice(item.price)}</td>
        <td className="px-4 py-3 text-navy-700">{formatQuantity(item.quantity, null)}</td>
        <td className="px-4 py-3">
          <StockBadge quantity={item.quantity} />
        </td>
        <td className="px-4 py-3">
          <QuantityStepper
            size="sm"
            value={quantity}
            disabled={!available}
            onChange={onQuantityChange}
            ariaLabel={`Quantity for ${item.name}`}
          />
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            disabled={!available}
            onClick={onAdd}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              available
                ? "bg-arizona-gold text-navy-900 hover:bg-arizona-gold/90"
                : "cursor-not-allowed bg-sand-200 text-navy-400"
            }`}
          >
            {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {added ? "Added" : available ? "Add to cart" : "Out of stock"}
          </button>
        </td>
      </tr>
    </>
  );
}
