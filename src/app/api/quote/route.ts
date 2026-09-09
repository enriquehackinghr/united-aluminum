import { NextResponse } from "next/server";
import { sendQuoteRequestEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to request a quote." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const product =
    typeof body === "object" && body && "product" in body ? String(body.product ?? "").trim() : "";
  const sku = typeof body === "object" && body && "sku" in body ? String(body.sku ?? "").trim() : "";

  if (!product) {
    return NextResponse.json({ error: "A product is required." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    user.email;

  try {
    await sendQuoteRequestEmail({
      name,
      email: user.email,
      product,
      sku: sku || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send quote request." },
      { status: 500 },
    );
  }
}
