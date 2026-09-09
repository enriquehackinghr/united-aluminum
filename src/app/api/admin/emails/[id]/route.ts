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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const log = await getEmailLog(id);
  if (!log) {
    return NextResponse.json({ error: "Email not found." }, { status: 404 });
  }

  return NextResponse.json({ log });
}
