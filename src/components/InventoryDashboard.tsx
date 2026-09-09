"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileSpreadsheet, LoaderCircle, Search, Upload, Warehouse } from "lucide-react";
import { Button } from "./Button";
import {
  formatPrice,
  formatQuantity,
  getInventoryStats,
  type CatalogItem,
  type InventoryUpload,
  type ParsedInventoryRow,
} from "@/lib/inventory";

type InventoryDashboardProps = {
  initialItems: CatalogItem[];
  initialUpload: InventoryUpload | null;
};

export function InventoryDashboard({ initialItems, initialUpload }: InventoryDashboardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [lastUpload, setLastUpload] = useState(initialUpload);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedInventoryRow[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<"preview" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stats = getInventoryStats(items);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.sku, item.name, item.category, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [items, query]);

  async function loadPreview(nextFile: File) {
    setError(null);
    setNotice(null);
    setPending("preview");
    setFile(nextFile);

    try {
      const body = new FormData();
      body.append("file", nextFile);
      const response = await fetch("/api/admin/inventory/preview", {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not read that file.");
      }
      setPreview(payload.preview ?? []);
      setPreviewCount(payload.rowCount ?? 0);
    } catch (previewError) {
      setFile(null);
      setPreview([]);
      setPreviewCount(0);
      setError(previewError instanceof Error ? previewError.message : "Could not read that file.");
    } finally {
      setPending(null);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) void loadPreview(nextFile);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void loadPreview(nextFile);
  }

  async function importFile() {
    if (!file) return;
    setError(null);
    setNotice(null);
    setPending("import");

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Import failed.");
      }

      setItems(payload.items ?? []);
      setLastUpload({
        id: "latest",
        file_name: file.name,
        row_count: payload.imported,
        import_batch_id: "",
        uploaded_by: null,
        created_at: new Date().toISOString(),
      });
      setNotice(
        `Imported ${payload.imported} inventory ${payload.imported === 1 ? "item" : "items"}. The customer catalog now uses this list.`,
      );
      setFile(null);
      setPreview([]);
      setPreviewCount(0);
      if (inputRef.current) inputRef.current.value = "";
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Items in inventory" value={stats.total.toLocaleString()} />
        <StatCard label="In stock" value={stats.inStock.toLocaleString()} />
        <StatCard
          label="Last import"
          value={
            lastUpload
              ? new Date(lastUpload.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "None yet"
          }
          hint={lastUpload ? `${lastUpload.row_count} rows from ${lastUpload.file_name}` : "Customers still see the current snapshot"}
        />
      </div>

      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">Upload inventory</h2>
            <p className="mt-1 text-sm text-navy-600">
              CSV or Excel files replace the live catalog. QuickBooks inventory exports are supported.
            </p>
          </div>
          <a
            href="/inventory-template.csv"
            className="text-sm font-semibold text-navy-700 hover:text-navy-500"
          >
            Download template
          </a>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            dragOver ? "border-navy-600 bg-navy-50" : "border-sand-300 bg-sand-50 hover:border-navy-400"
          }`}
        >
          <Upload className="mb-3 h-8 w-8 text-navy-600" />
          <p className="font-medium text-navy-900">Drop a .csv, .xls, or .xlsx file here</p>
          <p className="mt-1 text-sm text-navy-500">or click to browse · 8 MB max</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={onFileChange}
          />
        </label>

        {pending === "preview" && (
          <p className="mt-4 flex items-center gap-2 text-sm text-navy-600">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Reading spreadsheet…
          </p>
        )}

        {file && previewCount > 0 && (
          <div className="mt-6 rounded-xl border border-sand-200 bg-sand-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-navy-800">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="font-medium">{file.name}</span>
                <span className="text-navy-500">· {previewCount} rows ready</span>
              </div>
              <Button type="button" size="sm" onClick={() => void importFile()} disabled={pending !== null}>
                {pending === "import" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Replace inventory
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs text-navy-700">
                <thead>
                  <tr className="border-b border-sand-200 text-navy-500">
                    <th className="py-2 pr-4 font-medium">SKU</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Price</th>
                    <th className="py-2 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row) => (
                    <tr key={`${row.sku}-${row.source_row}`} className="border-b border-sand-100 last:border-0">
                      <td className="py-2 pr-4">{row.sku || "—"}</td>
                      <td className="py-2 pr-4">{row.name}</td>
                      <td className="py-2 pr-4">{row.category || "—"}</td>
                      <td className="py-2 pr-4">{formatPrice(row.price)}</td>
                      <td className="py-2">{formatQuantity(row.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-arizona-red/20 bg-arizona-red/5 px-4 py-3 text-sm text-arizona-red">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl border border-sage-400/30 bg-sage-400/10 px-4 py-3 text-sm text-navy-700">
            {notice}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">Current inventory</h2>
            <p className="mt-1 text-sm text-navy-600">
              {filtered.length.toLocaleString()} of {items.length.toLocaleString()} items
            </p>
          </div>
          <label className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search SKU, name, category…"
              className="w-full rounded-xl border border-sand-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-900 outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
          </label>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-sand-50 px-6 py-16 text-center">
            <Warehouse className="mb-3 h-10 w-10 text-navy-400" />
            <p className="font-medium text-navy-900">No replacement file uploaded yet</p>
            <p className="mt-1 max-w-md text-sm text-navy-600">
              Customers still see the current catalog snapshot. Upload a spreadsheet to replace it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-wide text-navy-500">
                  <th className="py-3 pr-4 font-semibold">SKU</th>
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Qty</th>
                  <th className="py-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.sku} className="border-b border-sand-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-navy-800">{item.sku}</td>
                    <td className="py-3 pr-4 text-navy-900">{item.name}</td>
                    <td className="py-3 pr-4 text-navy-700">{item.category}</td>
                    <td className="py-3 pr-4 text-navy-700">{formatQuantity(item.quantity)}</td>
                    <td className="py-3 text-navy-700">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-navy-900">{value}</p>
      {hint && <p className="mt-2 truncate text-xs text-navy-500">{hint}</p>}
    </div>
  );
}
