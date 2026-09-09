import { formatPrice } from "./inventory";

export type CartLine = {
  sku: string;
  name: string;
  category: string;
  price: number | null;
  quantity: number;
};

export const CART_STORAGE_KEY = "ua-cart";

export function normalizeQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export function lineTotal(line: CartLine) {
  if (line.price == null || line.price <= 0) return null;
  return line.price * line.quantity;
}

export function cartItemCount(items: CartLine[]) {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotal(items: CartLine[]) {
  return items.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);
}

export function hasPricedItems(items: CartLine[]) {
  return items.some((line) => line.price != null && line.price > 0);
}

export function formatLineTotal(line: CartLine) {
  const total = lineTotal(line);
  return total == null ? "Call for price" : formatPrice(total);
}

export function upsertCartLine(items: CartLine[], next: CartLine) {
  const quantity = normalizeQuantity(next.quantity);
  const index = items.findIndex((line) => line.sku === next.sku);

  if (index === -1) {
    return [...items, { ...next, quantity }];
  }

  return items.map((line, lineIndex) =>
    lineIndex === index
      ? { ...line, ...next, quantity: normalizeQuantity(line.quantity + quantity) }
      : line,
  );
}

export function setCartLineQuantity(items: CartLine[], sku: string, quantity: number) {
  if (quantity < 1) {
    return items.filter((line) => line.sku !== sku);
  }

  return items.map((line) =>
    line.sku === sku ? { ...line, quantity: normalizeQuantity(quantity) } : line,
  );
}

export function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const item = row as Partial<CartLine>;
        if (!item.sku || !item.name) return null;
        return {
          sku: String(item.sku),
          name: String(item.name),
          category: String(item.category || "Other"),
          price: typeof item.price === "number" && Number.isFinite(item.price) ? item.price : null,
          quantity: normalizeQuantity(Number(item.quantity)),
        } satisfies CartLine;
      })
      .filter((line): line is CartLine => line != null);
  } catch {
    return [];
  }
}

export function writeStoredCart(items: CartLine[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
