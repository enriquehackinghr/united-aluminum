import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { buildInventoryReview, type InventoryCheckPhase } from "@/lib/chief-of-staff";
import { getCeoEmail, sendInventoryBriefingEmail } from "@/lib/email";
import { getLiveInventory } from "@/lib/inventory-server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let phase: InventoryCheckPhase = "review";
  try {
    const body = (await request.json()) as { phase?: string };
    if (body.phase === "email") phase = "email";
  } catch {
    phase = "review";
  }

  try {
    const items = await getLiveInventory();
    const review = buildInventoryReview(items);

    if (phase === "review") {
      return NextResponse.json({ phase, review });
    }

    const emailedTo = await sendInventoryBriefingEmail(review);
    return NextResponse.json({ phase, review, emailedTo });
  } catch (error) {
    return NextResponse.json(
      {
        phase,
        emailedTo: getCeoEmail(),
        error: error instanceof Error ? error.message : "Could not complete the inventory briefing.",
      },
      { status: phase === "email" ? 502 : 500 },
    );
  }
}
