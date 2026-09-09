import { Resend } from "resend";
import {
  CEO_EMAIL,
  inventoryBriefingHtml,
  inventoryBriefingSubject,
  inventoryBriefingText,
  type InventoryReview,
} from "./chief-of-staff";
import { logEmail } from "./email-log";

const QUOTE_INBOX = "enrique@hackinghr.io";

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || process.env.Resend_API?.trim() || "";
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "United Aluminum <enrique@hackinghr.io>";
}

export function getQuoteInbox() {
  return process.env.QUOTE_REQUEST_EMAIL?.trim() || QUOTE_INBOX;
}

export function getCeoEmail() {
  return process.env.CEO_EMAIL?.trim() || CEO_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;color:#000e22;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2d4bc;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#000818;padding:24px 28px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#fed700;">United Aluminum</p>
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:15px;line-height:1.6;color:#001633;">
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const resend = new Resend(getResendApiKey());
  const safeName = name.trim() || "there";
  const subject = "Your United Aluminum account is ready";
  const html = emailLayout(
    "Account created",
    `<p>Hi ${escapeHtml(safeName)},</p>
       <p>Your United Aluminum customer account was created successfully. You can now sign in, browse live inventory, and request quotes for sheds, patio, and building products.</p>
       <p style="margin:24px 0 0;">If you did not create this account, you can ignore this email.</p>
       <p style="margin:24px 0 0;">— United Aluminum</p>`,
  );
  const text = `Hi ${safeName},\n\nYour United Aluminum customer account was created successfully. You can now sign in, browse live inventory, and request quotes.\n\n— United Aluminum`;

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    await logEmail({
      action: "Account created",
      recipient: email,
      subject,
      status: "sent",
      html,
      text,
      providerId: data?.id,
    });
  } catch (error) {
    await logEmail({
      action: "Account created",
      recipient: email,
      subject,
      status: "failed",
      error: error instanceof Error ? error.message : "Could not send welcome email.",
      html,
      text,
    });
    throw error;
  }
}

export async function sendQuoteRequestEmail({
  name,
  email,
  product,
  sku,
}: {
  name: string;
  email: string;
  product: string;
  sku?: string;
}) {
  const resend = new Resend(getResendApiKey());
  const skuLine = sku ? `<p style="margin:8px 0 0;"><strong>SKU:</strong> ${escapeHtml(sku)}</p>` : "";
  const skuText = sku ? `\nSKU: ${sku}` : "";
  const recipient = getQuoteInbox();
  const subject = `Quote request: ${product}`;
  const html = emailLayout(
    "New catalog quote request",
    `<p>A customer requested a quote from the inventory catalog.</p>
       <p style="margin:20px 0 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p style="margin:8px 0 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p style="margin:8px 0 0;"><strong>Product:</strong> ${escapeHtml(product)}</p>
       ${skuLine}`,
  );
  const text = `A customer requested a quote from the inventory catalog.\n\nName: ${name}\nEmail: ${email}\nProduct: ${product}${skuText}`;
  const metadata = { customerEmail: email, customerName: name, product, sku: sku ?? null };

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: recipient,
      replyTo: email,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    await logEmail({
      action: "Catalog quote request",
      recipient,
      subject,
      status: "sent",
      html,
      text,
      providerId: data?.id,
      metadata,
    });
  } catch (error) {
    await logEmail({
      action: "Catalog quote request",
      recipient,
      subject,
      status: "failed",
      error: error instanceof Error ? error.message : "Could not send quote request.",
      html,
      text,
      metadata,
    });
    throw error;
  }
}

export async function sendInventoryBriefingEmail(review: InventoryReview) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error("Resend is not configured. Add RESEND_API_KEY to send the CEO briefing.");
  }

  const resend = new Resend(apiKey);
  const to = getCeoEmail();
  const subject = inventoryBriefingSubject(review);
  const html = inventoryBriefingHtml(review);
  const text = inventoryBriefingText(review);
  const metadata = {
    inStock: review.inStock,
    lowStock: review.lowStock,
    outOfStock: review.outOfStock,
    total: review.total,
  };

  try {
    const sendPromise = resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
      text,
    });

    const { data, error } = await Promise.race([
      sendPromise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("The CEO email timed out. Try Check Inventory again.")), 20_000);
      }),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    await logEmail({
      action: "Check Inventory",
      recipient: to,
      subject,
      status: "sent",
      html,
      text,
      providerId: data?.id,
      metadata,
    });
    return to;
  } catch (error) {
    await logEmail({
      action: "Check Inventory",
      recipient: to,
      subject,
      status: "failed",
      error: error instanceof Error ? error.message : "Could not send inventory briefing.",
      html,
      text,
      metadata,
    });
    throw error;
  }
}
