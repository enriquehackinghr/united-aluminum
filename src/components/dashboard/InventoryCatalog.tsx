"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, PackageSearch, Search } from "lucide-react";
import {
  formatPrice,
  formatQuantity,
  getCategories,
  getStockStatus,
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
  const inventoryCategories = getCategories(items);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState(
    initialCategory && inventoryCategories.includes(initialCategory) ? initialCategory : "all",
  );
  const [stock, setStock] = useState<"all" | StockStatus>("all");
  const [page, setPage] = useState(1);
  const [quoteItem, setQuoteItem] = useState<CatalogItem | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !needle ||
        item.name.toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle);
      const matchesCategory = category === "all" || item.category === category;
      const matchesStock = stock === "all" || getStockStatus(item.quantity) === stock;
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [items, query, category, stock]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function openQuote(item: CatalogItem) {
    setQuoteItem(item);
    setQuoteError(null);
    setQuoteSent(false);
  }

  function closeQuote() {
    if (quotePending) return;
    setQuoteItem(null);
    setQuoteError(null);
    setQuoteSent(false);
  }

  async function confirmQuote() {
    if (!quoteItem) return;
    setQuotePending(true);
    setQuoteError(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: quoteItem.name,
          sku: quoteItem.sku,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Could not send quote request.");
      }
      setQuoteSent(true);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Could not send quote request.");
    } finally {
      setQuotePending(false);
    }
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
              placeholder="Search by name, SKU, or description"
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
            {visible.map((item) => (
              <article key={item.sku} className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                      {item.category}
                    </p>
                    <h3 className="mt-1 font-display text-base font-bold text-navy-900">{item.name}</h3>
                    <p className="mt-1 text-xs text-navy-500">SKU {item.sku}</p>
                  </div>
                  <StockBadge quantity={item.quantity} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy-900">{formatPrice(item.price)}</p>
                    <p className="text-xs text-navy-500">{formatQuantity(item.quantity, null)} on hand</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openQuote(item)}
                    className="rounded-xl bg-arizona-gold px-3 py-2 text-xs font-semibold text-navy-900"
                  >
                    Request quote
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy-950 text-xs uppercase tracking-wider text-mist-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.sku} className="border-t border-sand-100 hover:bg-sand-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{item.name}</p>
                      {item.description !== item.name && (
                        <p className="mt-0.5 max-w-md truncate text-xs text-navy-500">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-600">{item.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-600">{item.sku}</td>
                    <td className="px-4 py-3 font-semibold text-navy-900">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-navy-700">{formatQuantity(item.quantity, null)}</td>
                    <td className="px-4 py-3">
                      <StockBadge quantity={item.quantity} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openQuote(item)}
                        className="inline-flex rounded-lg bg-arizona-gold px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-arizona-gold/90"
                      >
                        Quote
                      </button>
                    </td>
                  </tr>
                ))}
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

      {quoteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close quote confirmation"
            className="absolute inset-0 bg-navy-950/60"
            onClick={closeQuote}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-confirm-title"
            className="relative w-full max-w-md rounded-2xl border border-sand-200 bg-white p-6 shadow-xl"
          >
            {quoteSent ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-widest text-arizona-copper">
                  Quote requested
                </p>
                <h2 id="quote-confirm-title" className="mt-2 font-display text-2xl font-bold text-navy-950">
                  We received your request
                </h2>
                <p className="mt-2 text-sm text-navy-600">
                  A quote request for <span className="font-semibold text-navy-900">{quoteItem.name}</span> was
                  sent. We&apos;ll follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={closeQuote}
                  className="mt-6 w-full rounded-xl bg-navy-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold uppercase tracking-widest text-arizona-copper">
                  Quote request
                </p>
                <h2 id="quote-confirm-title" className="mt-2 font-display text-2xl font-bold text-navy-950">
                  Confirm you need a quote
                </h2>
                <p className="mt-2 text-sm text-navy-600">
                  We&apos;ll email the team about{" "}
                  <span className="font-semibold text-navy-900">{quoteItem.name}</span>
                  {quoteItem.sku ? ` (SKU ${quoteItem.sku})` : ""}.
                </p>
                {quoteError && (
                  <p className="mt-4 rounded-xl border border-arizona-red/20 bg-arizona-red/5 px-4 py-3 text-sm text-arizona-red">
                    {quoteError}
                  </p>
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeQuote}
                    disabled={quotePending}
                    className="rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmQuote}
                    disabled={quotePending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-arizona-gold px-4 py-2.5 text-sm font-semibold text-navy-900 disabled:opacity-60"
                  >
                    {quotePending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Confirm quote
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
