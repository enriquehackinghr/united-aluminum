import { read, utils } from "xlsx";
import { MAX_INVENTORY_FILE_BYTES, parseInventorySheet } from "./inventory";

const ACCEPTED_EXTENSIONS = new Set(["csv", "xls", "xlsx"]);

export function parseInventoryFile(buffer: ArrayBuffer, fileName: string) {
  if (buffer.byteLength > MAX_INVENTORY_FILE_BYTES) {
    throw new Error("File is larger than 8 MB.");
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_EXTENSIONS.has(extension)) {
    throw new Error("Upload a .csv, .xls, or .xlsx file.");
  }

  const workbook = read(buffer, { type: "array", raw: false, cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The spreadsheet does not contain any sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: false,
    blankrows: false,
  });

  return parseInventorySheet(rows);
}
