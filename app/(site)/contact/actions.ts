"use server";

import { sendContactEmail } from "@/lib/email";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: bots fill hidden fields.
  if ((formData.get("website") as string)?.trim()) {
    return { status: "success", message: "Thanks! Your message was sent." };
  }

  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const subject = (formData.get("subject") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return { status: "error", message: "Please fill in all fields." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (message.length > 5000) {
    return { status: "error", message: "Message is too long." };
  }

  try {
    await sendContactEmail({ name, email, subject, message });
    return {
      status: "success",
      message: "Thanks for reaching out! We'll get back to you soon.",
    };
  } catch (err) {
    console.error("Contact form error:", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again later.",
    };
  }
}
