import {
  formatQuantity,
  getStockStatus,
  type CatalogItem,
  type StockStatus,
} from "./inventory";

export const CEO_EMAIL = "lisa@unitedalum.com";
export const REVIEW_LIST_LIMIT = 100;
export const EMAIL_LIST_LIMIT = 30;

export type InventoryReviewItem = {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  status: StockStatus;
};

export type InventoryReviewCategory = {
  category: string;
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};

export type InventoryReview = {
  generatedAt: string;
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  inStockPercent: number;
  categories: InventoryReviewCategory[];
  outOfStockItems: InventoryReviewItem[];
  lowStockItems: InventoryReviewItem[];
};

export type InventoryCheckPhase = "review" | "email";

export const INVENTORY_CHECK_STEPS = [
  { id: "load", label: "Load live inventory", until: 30 },
  { id: "review", label: "Review in-stock and out-of-stock items", until: 60 },
  { id: "email", label: "Send CEO briefing", until: 95 },
  { id: "done", label: "Complete", until: 100 },
] as const;

function toReviewItem(item: CatalogItem): InventoryReviewItem {
  return {
    sku: item.sku,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    status: getStockStatus(item.quantity),
  };
}

function byCategoryThenName(a: CatalogItem, b: CatalogItem) {
  return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
}

export function buildInventoryReview(items: CatalogItem[], generatedAt = new Date()): InventoryReview {
  const inStockItems = items.filter((item) => item.quantity > 0);
  const lowStockItems = items
    .filter((item) => item.quantity > 0 && item.quantity < 10)
    .sort((a, b) => a.quantity - b.quantity || byCategoryThenName(a, b));
  const outOfStockItems = items.filter((item) => item.quantity <= 0).sort(byCategoryThenName);

  const categoryMap = new Map<string, InventoryReviewCategory>();
  for (const item of items) {
    const current = categoryMap.get(item.category) ?? {
      category: item.category,
      total: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };
    current.total += 1;
    if (item.quantity <= 0) current.outOfStock += 1;
    else current.inStock += 1;
    if (item.quantity > 0 && item.quantity < 10) current.lowStock += 1;
    categoryMap.set(item.category, current);
  }

  return {
    generatedAt: generatedAt.toISOString(),
    total: items.length,
    inStock: inStockItems.length,
    lowStock: lowStockItems.length,
    outOfStock: outOfStockItems.length,
    inStockPercent: items.length ? Math.round((inStockItems.length / items.length) * 100) : 0,
    categories: [...categoryMap.values()].sort((a, b) => b.outOfStock - a.outOfStock || a.category.localeCompare(b.category)),
    outOfStockItems: outOfStockItems.slice(0, REVIEW_LIST_LIMIT).map(toReviewItem),
    lowStockItems: lowStockItems.slice(0, REVIEW_LIST_LIMIT).map(toReviewItem),
  };
}

export function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function briefingHeadline(review: InventoryReview) {
  if (review.total === 0) {
    return "No inventory items are available to review yet.";
  }
  if (review.outOfStock === 0 && review.lowStock === 0) {
    return `All ${review.total.toLocaleString()} inventory items currently show stock on hand.`;
  }
  if (review.outOfStock === 0) {
    return `${review.inStock.toLocaleString()} items are in stock. ${review.lowStock.toLocaleString()} ${review.lowStock === 1 ? "item is" : "items are"} running low and may need a reorder soon.`;
  }
  return `${review.outOfStock.toLocaleString()} ${review.outOfStock === 1 ? "item is" : "items are"} out of stock, and ${review.lowStock.toLocaleString()} ${review.lowStock === 1 ? "item is" : "items are"} running low. ${review.inStockPercent}% of the catalog still has quantity on hand.`;
}

function itemRows(items: InventoryReviewItem[], emptyLabel: string, limit = EMAIL_LIST_LIMIT) {
  if (!items.length) {
    return `<tr><td colspan="4" style="padding:14px 16px;font-size:13px;color:#335589;">${escapeHtml(emptyLabel)}</td></tr>`;
  }

  const visible = items.slice(0, limit);
  const rows = visible
    .map((item, index) => {
      const background = index % 2 === 0 ? "#ffffff" : "#faf6f0";
      return `<tr>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:12px;color:#335589;white-space:nowrap;">${escapeHtml(item.sku)}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#000e22;font-weight:600;">${escapeHtml(item.name)}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#335589;">${escapeHtml(item.category)}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#000e22;text-align:right;">${escapeHtml(formatQuantity(item.quantity))}</td>
      </tr>`;
    })
    .join("");

  const overflow = items.length > limit
    ? `<tr><td colspan="4" style="padding:12px 16px;background:#f0e8da;font-size:12px;color:#335589;">Showing ${limit} of ${items.length.toLocaleString()} items in this briefing.</td></tr>`
    : "";

  return `${rows}${overflow}`;
}

function categoryRows(categories: InventoryReviewCategory[]) {
  if (!categories.length) {
    return `<tr><td colspan="4" style="padding:14px 16px;font-size:13px;color:#335589;">No categories to report.</td></tr>`;
  }

  return categories
    .map((category, index) => {
      const background = index % 2 === 0 ? "#ffffff" : "#faf6f0";
      return `<tr>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#000e22;font-weight:600;">${escapeHtml(category.category)}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#335589;text-align:right;">${category.inStock.toLocaleString()}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#c4622d;text-align:right;">${category.lowStock.toLocaleString()}</td>
        <td style="padding:11px 16px;border-top:1px solid #f0e8da;background:${background};font-size:13px;color:#bf0a30;text-align:right;">${category.outOfStock.toLocaleString()}</td>
      </tr>`;
    })
    .join("");
}

export function inventoryBriefingHtml(review: InventoryReview) {
  const dateLabel = formatReviewDate(review.generatedAt);
  const headline = briefingHeadline(review);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>United Aluminum inventory briefing</title>
  </head>
  <body style="margin:0;padding:0;background:#f3eee6;font-family:Georgia,'Times New Roman',Times,serif;color:#000e22;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3eee6;padding:36px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e2d4bc;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="height:6px;background:#fed700;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:#000818;padding:32px 36px 28px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#fed700;">United Aluminum · Chief of Staff</p>
                <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;color:#ffffff;font-weight:700;">Inventory briefing</h1>
                <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#d4dce9;">Prepared for Lisa · ${escapeHtml(dateLabel)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px 8px;font-size:16px;line-height:1.7;color:#001633;">
                <p style="margin:0;">Lisa,</p>
                <p style="margin:14px 0 0;">${escapeHtml(headline)}</p>
                <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#335589;">This report uses the live catalog. Out of stock is quantity at or below zero. Low stock is fewer than 10 units on hand.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" valign="top" style="padding:0 6px 12px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f0;border:1px solid #e2d4bc;border-radius:14px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#335589;">Catalog items</p>
                            <p style="margin:8px 0 0;font-size:28px;line-height:1;color:#000818;font-weight:700;">${review.total.toLocaleString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="50%" valign="top" style="padding:0 0 12px 6px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7ef;border:1px solid #d5ddc4;border-radius:14px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6d7a52;">In stock</p>
                            <p style="margin:8px 0 0;font-size:28px;line-height:1;color:#6d7a52;font-weight:700;">${review.inStock.toLocaleString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:0 6px 0 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8d6;border:1px solid #f0e08a;border-radius:14px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7d6544;">Low stock</p>
                            <p style="margin:8px 0 0;font-size:28px;line-height:1;color:#c4622d;font-weight:700;">${review.lowStock.toLocaleString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="50%" valign="top" style="padding:0 0 0 6px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdecef;border:1px solid #f3c5cf;border-radius:14px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#bf0a30;">Out of stock</p>
                            <p style="margin:8px 0 0;font-size:28px;line-height:1;color:#bf0a30;font-weight:700;">${review.outOfStock.toLocaleString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 8px;">
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#bf0a30;">Needs attention</p>
                <h2 style="margin:0 0 14px;font-size:22px;color:#000818;">Out of stock</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d4bc;border-radius:14px;overflow:hidden;">
                  <tr>
                    <th align="left" style="padding:12px 16px;background:#000818;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">SKU</th>
                    <th align="left" style="padding:12px 16px;background:#000818;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Item</th>
                    <th align="left" style="padding:12px 16px;background:#000818;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Category</th>
                    <th align="right" style="padding:12px 16px;background:#000818;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Qty</th>
                  </tr>
                  ${itemRows(review.outOfStockItems, "Nothing is out of stock right now.")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 8px;">
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#c4622d;">Watch list</p>
                <h2 style="margin:0 0 14px;font-size:22px;color:#000818;">Low stock</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d4bc;border-radius:14px;overflow:hidden;">
                  <tr>
                    <th align="left" style="padding:12px 16px;background:#001633;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">SKU</th>
                    <th align="left" style="padding:12px 16px;background:#001633;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Item</th>
                    <th align="left" style="padding:12px 16px;background:#001633;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Category</th>
                    <th align="right" style="padding:12px 16px;background:#001633;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fed700;">Qty</th>
                  </tr>
                  ${itemRows(review.lowStockItems, "No items are below the low-stock threshold.")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 8px;">
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#002868;">By category</p>
                <h2 style="margin:0 0 14px;font-size:22px;color:#000818;">Category snapshot</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d4bc;border-radius:14px;overflow:hidden;">
                  <tr>
                    <th align="left" style="padding:12px 16px;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#335589;">Category</th>
                    <th align="right" style="padding:12px 16px;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#335589;">In stock</th>
                    <th align="right" style="padding:12px 16px;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#335589;">Low</th>
                    <th align="right" style="padding:12px 16px;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#335589;">Out</th>
                  </tr>
                  ${categoryRows(review.categories)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px 36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#335589;">
                <p style="margin:0;">This briefing was generated from the United Aluminum admin dashboard. Reply if you want purchasing follow-up on any SKU.</p>
                <p style="margin:18px 0 0;color:#000818;font-weight:700;">— Chief of Staff</p>
              </td>
            </tr>
            <tr>
              <td style="background:#000818;padding:18px 36px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a9b9d3;">
                United Aluminum · Phoenix, Arizona
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function inventoryBriefingText(review: InventoryReview) {
  const dateLabel = formatReviewDate(review.generatedAt);
  const lines = [
    "United Aluminum · Chief of Staff",
    `Inventory briefing for Lisa · ${dateLabel}`,
    "",
    briefingHeadline(review),
    "",
    `Catalog items: ${review.total}`,
    `In stock: ${review.inStock}`,
    `Low stock: ${review.lowStock}`,
    `Out of stock: ${review.outOfStock}`,
    "",
    "Out of stock",
  ];

  if (!review.outOfStockItems.length) {
    lines.push("Nothing is out of stock right now.");
  } else {
    for (const item of review.outOfStockItems.slice(0, EMAIL_LIST_LIMIT)) {
      lines.push(`- ${item.sku} · ${item.name} · ${item.category} · qty ${formatQuantity(item.quantity)}`);
    }
  }

  lines.push("", "Low stock");
  if (!review.lowStockItems.length) {
    lines.push("No items are below the low-stock threshold.");
  } else {
    for (const item of review.lowStockItems.slice(0, EMAIL_LIST_LIMIT)) {
      lines.push(`- ${item.sku} · ${item.name} · ${item.category} · qty ${formatQuantity(item.quantity)}`);
    }
  }

  lines.push("", "— Chief of Staff");
  return lines.join("\n");
}

export function inventoryBriefingSubject(review: InventoryReview) {
  const dateLabel = new Date(review.generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (review.outOfStock > 0) {
    return `Inventory briefing · ${review.outOfStock} out of stock · ${dateLabel}`;
  }

  return `Inventory briefing · all items in stock · ${dateLabel}`;
}
