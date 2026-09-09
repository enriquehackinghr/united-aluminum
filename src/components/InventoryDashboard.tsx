"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Check, ClipboardCheck, FileSpreadsheet, LoaderCircle, Mail, Search, Upload, Warehouse } from "lucide-react";
import { Button } from "./Button";
import { EmailLog } from "./dashboard/EmailLog";
import {
  formatReviewDate,
  INVENTORY_CHECK_STEPS,
  type InventoryReview,
} from "@/lib/chief-of-staff";
import type { EmailLogEntry } from "@/lib/email-log";
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
  initialEmailLogs: EmailLogEntry[];
};

export function InventoryDashboard({ initialItems, initialUpload, initialEmailLogs }: InventoryDashboardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [lastUpload, setLastUpload] = useState(initialUpload);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedInventoryRow[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<"preview" | "import" | "check" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [review, setReview] = useState<InventoryReview | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [emailedTo, setEmailedTo] = useState<string | null>(null);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkMessage, setCheckMessage] = useState("");
  const [emailLogs, setEmailLogs] = useState(initialEmailLogs);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [tab, setTab] = useState<"inventory" | "emails">("inventory");
  const progressTarget = useRef(0);

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

  useEffect(() => {
    if (tab !== "emails") return;
    void refreshEmailLogs();
  }, [tab]);

  useEffect(() => {
    if (pending !== "check") return;

    const timer = window.setInterval(() => {
      setCheckProgress((current) => {
        const target = progressTarget.current;
        if (current >= target) return current;
        const next = current + Math.max(0.6, (target - current) * 0.12);
        return Math.min(target, next);
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [pending]);

  function beginCheckStage(target: number, message: string) {
    progressTarget.current = target;
    setCheckMessage(message);
  }

  async function refreshEmailLogs() {
    setEmailLogsLoading(true);
    try {
      const response = await fetch("/api/admin/emails", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok && Array.isArray(payload.logs)) {
        setEmailLogs(payload.logs);
      }
    } catch {
      // Keep the current log if refresh fails.
    } finally {
      setEmailLogsLoading(false);
    }
  }

  async function postInventoryCheck(phase: "review" | "email", timeoutMs: number) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("/api/admin/inventory/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Inventory ${phase} failed.`);
      }
      return payload as { review?: InventoryReview; emailedTo?: string; error?: string };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(
          phase === "email"
            ? "Sending the CEO email took too long. The stock review finished, but the briefing was not sent."
            : "Loading inventory took too long. Try Check Inventory again.",
        );
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function checkInventory() {
    setReviewError(null);
    setEmailedTo(null);
    setReview(null);
    setCheckProgress(4);
    setCheckMessage("Starting inventory review…");
    progressTarget.current = 18;
    setPending("check");

    try {
      beginCheckStage(38, "Loading live inventory…");
      await new Promise((resolve) => window.setTimeout(resolve, 160));
      beginCheckStage(58, "Reviewing in-stock and out-of-stock items…");
      const reviewPayload = await postInventoryCheck("review", 20_000);
      if (reviewPayload.review) {
        setReview(reviewPayload.review);
      }

      beginCheckStage(88, "Sending the CEO briefing to Lisa…");
      const emailPayload = await postInventoryCheck("email", 25_000);
      if (emailPayload.review) {
        setReview(emailPayload.review);
      }
      setEmailedTo(emailPayload.emailedTo ?? null);
      progressTarget.current = 100;
      setCheckProgress(100);
      setCheckMessage("Inventory review complete.");
      await refreshEmailLogs();
    } catch (checkError) {
      setReviewError(checkError instanceof Error ? checkError.message : "Could not complete the inventory check.");
      setCheckMessage("Inventory check stopped.");
      await refreshEmailLogs();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-sand-200 bg-white p-1.5 shadow-sm">
        {(
          [
            { id: "inventory", label: "Inventory" },
            { id: "emails", label: "Email log" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === item.id
                ? "bg-navy-950 text-white"
                : "text-navy-700 hover:bg-sand-100"
            }`}
          >
            {item.label}
            {item.id === "emails" && emailLogs.length > 0 ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === item.id ? "bg-white/15 text-arizona-gold" : "bg-sand-100 text-navy-600"}`}>
                {emailLogs.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "emails" ? (
        emailLogsLoading && emailLogs.length === 0 ? (
          <section className="rounded-2xl border border-sand-200 bg-white px-6 py-16 text-center shadow-sm">
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-navy-600" />
            <p className="mt-3 text-sm text-navy-600">Loading sent emails…</p>
          </section>
        ) : (
          <EmailLog logs={emailLogs} />
        )
      ) : null}

      {tab === "inventory" ? (
      <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-navy-900 bg-navy-950 shadow-sm">
        <div className="arizona-stripe" aria-hidden />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-arizona-gold">
                Chief of Staff
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Inventory briefing</h2>
              <p className="mt-2 max-w-2xl text-sm text-mist-200">
                Review live stock, flag what is out or running low, and send a designed briefing to the CEO.
              </p>
            </div>
            <Button type="button" size="sm" onClick={() => void checkInventory()} disabled={pending !== null}>
              {pending === "check" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
              {pending === "check" ? "Checking inventory…" : "Check Inventory"}
            </Button>
          </div>

          {checkMessage && (
            <div className="mt-6 rounded-xl border border-arizona-gold/25 bg-white/5 p-5" aria-live="polite">
              <div className="flex items-start gap-3">
                {pending === "check" ? (
                  <LoaderCircle className="mt-0.5 h-6 w-6 shrink-0 animate-spin text-arizona-gold" />
                ) : reviewError ? (
                  <ClipboardCheck className="mt-0.5 h-6 w-6 shrink-0 text-arizona-red" />
                ) : (
                  <Check className="mt-0.5 h-6 w-6 shrink-0 text-sage-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{checkMessage}</p>
                    <p className="shrink-0 text-sm font-semibold text-arizona-gold">{Math.round(checkProgress)}%</p>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-arizona-gold transition-[width] duration-150 ease-out"
                      style={{ width: `${Math.min(100, checkProgress)}%` }}
                    />
                  </div>
                  <ol className="mt-4 grid gap-2 text-xs text-mist-300 sm:grid-cols-2">
                    {INVENTORY_CHECK_STEPS.map((step, index) => {
                      const from = index === 0 ? 0 : INVENTORY_CHECK_STEPS[index - 1].until;
                      const complete = checkProgress >= step.until;
                      const current = pending === "check" && !complete && checkProgress >= from;
                      return (
                        <li key={step.id} className={complete ? "text-sage-400" : current ? "text-arizona-gold" : ""}>
                          {complete ? "✓" : current ? "●" : "○"} {step.label}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {reviewError && (
            <p className="mt-5 rounded-xl border border-arizona-red/30 bg-arizona-red/10 px-4 py-3 text-sm text-white">
              {reviewError}
            </p>
          )}

          {review && (
            <div className="mt-6 space-y-5">
              {emailedTo && (
                <p className="flex items-center gap-2 rounded-xl border border-arizona-gold/20 bg-white/5 px-4 py-3 text-sm text-mist-100">
                  <Mail className="h-4 w-4 text-arizona-gold" />
                  Briefing emailed to {emailedTo} · {formatReviewDate(review.generatedAt)}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ReviewStat label="Reviewed" value={review.total.toLocaleString()} />
                <ReviewStat label="In stock" value={review.inStock.toLocaleString()} tone="good" />
                <ReviewStat label="Low stock" value={review.lowStock.toLocaleString()} tone="warn" />
                <ReviewStat label="Out of stock" value={review.outOfStock.toLocaleString()} tone="alert" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <ReviewList
                  title="Out of stock"
                  empty="Nothing is out of stock right now."
                  items={review.outOfStockItems}
                />
                <ReviewList
                  title="Low stock"
                  empty="No items are below the low-stock threshold."
                  items={review.lowStockItems}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Items in inventory" value={stats.total.toLocaleString()} />
        <StatCard label="In stock" value={stats.inStock.toLocaleString()} />
        <StatCard label="Out of stock" value={stats.outOfStock.toLocaleString()} />
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
      ) : null}
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

function ReviewStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "alert";
}) {
  const valueClass = {
    neutral: "text-white",
    good: "text-sage-400",
    warn: "text-arizona-gold",
    alert: "text-arizona-red",
  }[tone];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-mist-300">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function ReviewList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: InventoryReview["outOfStockItems"];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-mist-200">{empty}</p>
      ) : (
        <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
          {items.map((item) => (
            <li key={`${item.sku}-${item.name}`} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-xs text-mist-300">
                  {item.sku} · {item.category}
                </p>
              </div>
              <span className="shrink-0 text-mist-200">{formatQuantity(item.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
