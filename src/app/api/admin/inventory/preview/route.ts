import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { MAX_INVENTORY_FILE_BYTES } from "@/lib/inventory";
import { parseInventoryFile } from "@/lib/parse-spreadsheet";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a CSV or Excel file to upload." }, { status: 400 });
  }

  if (file.size > MAX_INVENTORY_FILE_BYTES) {
    return NextResponse.json({ error: "File is larger than 8 MB." }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const rows = parseInventoryFile(buffer, file.name);
    return NextResponse.json({
      fileName: file.name,
      rowCount: rows.length,
      preview: rows.slice(0, 25),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read that file." },
      { status: 400 },
    );
  }
}
