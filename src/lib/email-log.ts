import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export type EmailLogStatus = "sent" | "failed";

export type EmailLogEntry = {
  id: string;
  action: string;
  recipient: string;
  subject: string;
  status: EmailLogStatus;
  error: string | null;
  html?: string | null;
  text_body?: string | null;
  provider_id?: string | null;
  triggered_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type EmailLogInput = {
  action: string;
  recipient: string;
  subject: string;
  status: EmailLogStatus;
  error?: string | null;
  html?: string | null;
  text?: string | null;
  providerId?: string | null;
  metadata?: Record<string, unknown>;
};

const LOG_COLUMNS =
  "id, action, recipient, subject, status, error, html, text_body, provider_id, triggered_by, metadata, created_at";

function inferEmailAction(subject: string) {
  if (/inventory briefing/i.test(subject)) return "Check Inventory";
  if (/quote request/i.test(subject)) return "Catalog quote request";
  if (/account is ready|account created/i.test(subject)) return "Account created";
  return "Outbound email";
}

function asRecipient(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value?.trim() || "Unknown recipient";
}

export async function logEmail(entry: EmailLogInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("email_logs").insert({
      action: entry.action,
      recipient: entry.recipient,
      subject: entry.subject,
      status: entry.status,
      error: entry.error ?? null,
      html: entry.html ?? null,
      text_body: entry.text ?? null,
      provider_id: entry.providerId ?? null,
      triggered_by: user?.id ?? null,
      metadata: entry.metadata ?? {},
    });

    if (error) {
      console.error("Could not write email log:", error.message);
    }
  } catch (error) {
    console.error(
      "Could not write email log:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function getEmailLogs(): Promise<EmailLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select(LOG_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data as EmailLogEntry[];
}

export async function getEmailLog(id: string): Promise<EmailLogEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select(LOG_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const log = data as EmailLogEntry;
  if (log.html || log.text_body || !log.provider_id) {
    return log;
  }

  return (await fillEmailContent(log)) ?? log;
}

async function fillEmailContent(log: EmailLogEntry) {
  const apiKey = process.env.RESEND_API_KEY?.trim() || process.env.Resend_API?.trim() || "";
  if (!apiKey || !log.provider_id) return null;

  const resend = new Resend(apiKey);
  const full = await Promise.race([
    resend.emails.get(log.provider_id),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timed out loading email content.")), 6_000);
    }),
  ]).catch(() => null);

  if (!full?.data) return null;

  const html = full.data.html ?? null;
  const text_body = full.data.text ?? null;
  const supabase = await createClient();
  await supabase.from("email_logs").update({ html, text_body }).eq("id", log.id);

  return { ...log, html, text_body };
}

export async function syncSentEmails() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || process.env.Resend_API?.trim() || "";
  if (!apiKey) return;

  const supabase = await createClient();
  const resend = new Resend(apiKey);
  const listed = await resend.emails.list({ limit: 50 });
  const rows = listed.data?.data ?? [];
  if (listed.error || !rows.length) return;

  const { data: existing } = await supabase.from("email_logs").select("provider_id");
  const known = new Set((existing ?? []).map((row) => row.provider_id).filter(Boolean));

  for (const item of rows) {
    if (known.has(item.id)) continue;

    const full = await resend.emails.get(item.id);
    const email = full.data;
    if (full.error || !email) continue;

    const lastEvent = String(email.last_event ?? item.last_event ?? "sent");
    const failed = /failed|bounced|complained/i.test(lastEvent);

    const { error } = await supabase.from("email_logs").insert({
      action: inferEmailAction(email.subject ?? item.subject ?? ""),
      recipient: asRecipient(email.to ?? item.to),
      subject: email.subject ?? item.subject ?? "Untitled email",
      status: failed ? "failed" : "sent",
      error: failed ? lastEvent : null,
      html: email.html ?? null,
      text_body: email.text ?? null,
      provider_id: email.id ?? item.id,
      metadata: { source: "resend", lastEvent },
      created_at: email.created_at ?? item.created_at,
    });

    if (!error) {
      known.add(item.id);
    }
  }
}
