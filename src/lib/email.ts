import { Resend } from "resend";

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

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Your United Aluminum account is ready",
    html: emailLayout(
      "Account created",
      `<p>Hi ${escapeHtml(safeName)},</p>
       <p>Your United Aluminum customer account was created successfully. You can now sign in, browse live inventory, and request quotes for sheds, patio, and building products.</p>
       <p style="margin:24px 0 0;">If you did not create this account, you can ignore this email.</p>
       <p style="margin:24px 0 0;">— United Aluminum</p>`,
    ),
    text: `Hi ${safeName},\n\nYour United Aluminum customer account was created successfully. You can now sign in, browse live inventory, and request quotes.\n\n— United Aluminum`,
  });

  if (error) {
    throw new Error(error.message);
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

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: getQuoteInbox(),
    replyTo: email,
    subject: `Quote request: ${product}`,
    html: emailLayout(
      "New catalog quote request",
      `<p>A customer requested a quote from the inventory catalog.</p>
       <p style="margin:20px 0 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p style="margin:8px 0 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p style="margin:8px 0 0;"><strong>Product:</strong> ${escapeHtml(product)}</p>
       ${skuLine}`,
    ),
    text: `A customer requested a quote from the inventory catalog.\n\nName: ${name}\nEmail: ${email}\nProduct: ${product}${skuText}`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
