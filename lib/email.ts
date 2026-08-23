import { Resend } from "resend";

const DEFAULT_FROM =
  "Parahyangan Finance Club Website <onboarding@resend.dev>";

function senderAddress(): string {
  const configured = process.env.CONTACT_EMAIL_FROM?.trim();
  if (!configured) return DEFAULT_FROM;

  const match = configured.match(
    /^(?:.+\s+)?<([^<>\s]+@[^<>\s]+)>$|^([^<>\s]+@[^<>\s]+)$/,
  );
  return match ? configured : DEFAULT_FROM;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Send a contact-form message by email via Resend.
 * If RESEND_API_KEY is not configured (e.g. local dev), the message is logged
 * to the server console instead so the form stays testable.
 */
export async function sendContactEmail(msg: ContactMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = senderAddress();

  if (!apiKey || !to) {
    console.log("[contact] Resend not configured  message logged instead:");
    console.log(JSON.stringify(msg, null, 2));
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: msg.email,
    subject: `[Parahyangan Finance Club Contact] ${msg.subject}`,
    text: `New message from the Parahyangan Finance Club website contact form:\n\nName: ${msg.name}\nEmail: ${msg.email}\nSubject: ${msg.subject}\n\n${msg.message}`,
    html: `
      <h2>New contact message  Parahyangan Finance Club website</h2>
      <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(msg.subject)}</p>
      <hr />
      <p style="white-space: pre-wrap;">${escapeHtml(msg.message)}</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send a transactional auth email. Signup no longer confirms addresses, so the
 * password reset link is the only one left.
 * Falls back to logging the link to the server console when Resend is not
 * configured, so the flow stays testable in local dev.
 */
export async function sendAuthEmail(
  to: string,
  kind: "reset" | "verify",
  link: string,
): Promise<void> {
  const verify = kind === "verify";
  const subject = verify
    ? "Confirm your Parahyangan Finance Club email"
    : "Reset your Parahyangan Finance Club password";
  const heading = verify ? "Confirm your email" : "Reset your password";
  const body = verify
    ? "Confirm this address so we know club email reaches you. This link expires in 24 hours. If you did not ask for it, you can safely ignore this email."
    : "We received a request to reset your Parahyangan Finance Club password. This link expires in 1 hour. If you did not request it, you can safely ignore this email.";
  const cta = verify ? "Confirm Email" : "Reset Password";

  const apiKey = process.env.RESEND_API_KEY;
  const from = senderAddress();

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured in production.");
    }
    console.log(`[auth] Resend not configured  ${kind} link for ${to}:`);
    console.log(link);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: `${heading}\n\n${body}\n\n${link}`,
    html: `
      <h2>${heading}</h2>
      <p>${body}</p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#144DC8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${cta}</a></p>
      <p style="color:#64748b;font-size:12px;">Or paste this link into your browser:<br />${escapeHtml(link)}</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
