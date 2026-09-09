import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body === "object" && body && "email" in body ? String(body.email ?? "").trim() : "";
  const name = typeof body === "object" && body && "name" in body ? String(body.name ?? "").trim() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  try {
    await sendWelcomeEmail({ name, email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send confirmation email." },
      { status: 500 },
    );
  }
}
