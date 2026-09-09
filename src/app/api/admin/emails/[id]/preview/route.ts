import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { getEmailLog } from "@/lib/email-log";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return new NextResponse("Sign in as an admin to preview this email.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { id } = await params;
  const log = await getEmailLog(id);
  if (!log) {
    return new NextResponse("Email not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (log.html) {
    return new NextResponse(log.html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  }

  const text = log.text_body?.trim() || "No email content was stored for this message.";
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${log.subject}</title></head><body style="margin:0;padding:24px;font-family:Arial,sans-serif;white-space:pre-wrap;">${escaped}</body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Frame-Options": "SAMEORIGIN",
      },
    },
  );
}
