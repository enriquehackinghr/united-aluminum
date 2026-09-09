import { after } from "next/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { getEmailLogs, syncSentEmails } from "@/lib/email-log";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  after(() => {
    void syncSentEmails().catch((error) => {
      console.error("Could not sync sent emails:", error instanceof Error ? error.message : error);
    });
  });

  const logs = await getEmailLogs();
  return NextResponse.json({ logs });
}
