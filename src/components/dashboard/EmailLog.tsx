"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { EmailLogEntry } from "@/lib/email-log";

function formatLogTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function previewHref(id: string) {
  return `/api/admin/emails/${id}/preview`;
}

export function EmailLog({ logs }: { logs: EmailLogEntry[] }) {
  const [selected, setSelected] = useState<EmailLogEntry | null>(null);

  function viewEmail(log: EmailLogEntry) {
    setSelected(log);
  }

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-navy-900">Email log</h2>
        <p className="mt-1 text-sm text-navy-600">
          Sent emails and the action that triggered each one. Open any message to review the content.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="rounded-xl bg-sand-50 px-4 py-8 text-center text-sm text-navy-600">
          No sent emails were found yet. Check Inventory, quote requests, and new accounts will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs uppercase tracking-wide text-navy-500">
                <th className="py-3 pr-4 font-semibold">Sent</th>
                <th className="py-3 pr-4 font-semibold">Action</th>
                <th className="py-3 pr-4 font-semibold">Recipient</th>
                <th className="py-3 pr-4 font-semibold">Subject</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-sand-100 last:border-0 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap text-navy-700">{formatLogTime(log.created_at)}</td>
                  <td className="py-3 pr-4 font-medium text-navy-900">{log.action}</td>
                  <td className="py-3 pr-4 text-navy-700">{log.recipient}</td>
                  <td className="py-3 pr-4 text-navy-700">
                    <p>{log.subject}</p>
                    {log.error && <p className="mt-1 text-xs text-arizona-red">{log.error}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        log.status === "sent"
                          ? "bg-sage-400/15 text-sage-500"
                          : "bg-arizona-red/10 text-arizona-red"
                      }`}
                    >
                      {log.status === "sent" ? "Sent" : "Failed"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => viewEmail(log)}
                      className="text-xs font-bold uppercase tracking-wide text-navy-800 hover:text-navy-600"
                    >
                      View Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-500">{selected.action}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-navy-900">{selected.subject}</h3>
                <p className="mt-1 text-sm text-navy-600">
                  To {selected.recipient} · {formatLogTime(selected.created_at)}
                </p>
                <a
                  href={previewHref(selected.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-navy-800 hover:text-navy-600"
                >
                  Open preview in a new tab
                </a>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-navy-500 hover:bg-sand-100 hover:text-navy-900"
                aria-label="Close email preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-sand-50 p-4">
              <iframe
                title={selected.subject}
                src={previewHref(selected.id)}
                className="h-[65vh] w-full rounded-xl border border-sand-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
