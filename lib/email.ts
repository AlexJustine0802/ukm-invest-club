import { Resend } from "resend";

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
  const from =
    process.env.CONTACT_EMAIL_FROM || "ICUnpar Website <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.log("[contact] Resend not configured — message logged instead:");
    console.log(JSON.stringify(msg, null, 2));
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: msg.email,
    subject: `[ICUnpar Contact] ${msg.subject}`,
    text: `New message from the ICUnpar website contact form:\n\nName: ${msg.name}\nEmail: ${msg.email}\nSubject: ${msg.subject}\n\n${msg.message}`,
    html: `
      <h2>New contact message — ICUnpar website</h2>
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
