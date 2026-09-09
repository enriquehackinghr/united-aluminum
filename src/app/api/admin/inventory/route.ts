import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { MAX_INVENTORY_FILE_BYTES, toCatalogItem } from "@/lib/inventory";
import { parseInventoryFile } from "@/lib/parse-spreadsheet";
import { createClient } from "@/lib/supabase/server";

const INSERT_CHUNK = 200;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [itemsResult, uploadResult] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("inventory_uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (itemsResult.error) {
    return NextResponse.json({ error: itemsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: (itemsResult.data ?? []).map((row) => toCatalogItem(row)),
    lastUpload: uploadResult.data ?? null,
  });
}

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
    const importBatchId = randomUUID();

    const payload = rows.map((row) => ({
      sku: row.sku,
      name: row.name,
      category: row.category,
      item_type: row.type,
      description: row.description,
      price: row.price,
      quantity: row.quantity,
      taxable: row.taxable,
      as_of: row.asOf,
      attributes: row.attributes,
      source_row: row.source_row,
      import_batch_id: importBatchId,
      uploaded_by: user.id,
    }));

    for (let i = 0; i < payload.length; i += INSERT_CHUNK) {
      const chunk = payload.slice(i, i + INSERT_CHUNK);
      const { error } = await supabase.from("inventory_items").insert(chunk);
      if (error) {
        await supabase.from("inventory_items").delete().eq("import_batch_id", importBatchId);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { error: cleanupError } = await supabase
      .from("inventory_items")
      .delete()
      .neq("import_batch_id", importBatchId);

    if (cleanupError) {
      return NextResponse.json({ error: cleanupError.message }, { status: 500 });
    }

    const { error: uploadError } = await supabase.from("inventory_uploads").insert({
      file_name: file.name,
      row_count: rows.length,
      import_batch_id: importBatchId,
      uploaded_by: user.id,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({
      imported: rows.length,
      items: rows.map((row) => toCatalogItem(row)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not import that file." },
      { status: 400 },
    );
  }
}
