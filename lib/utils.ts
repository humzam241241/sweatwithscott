import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Very small mailer shim; replace with Resend/SMTP in production
export type MailPayload = { to: string; subject: string; text: string };
export async function sendMail({ to, subject, text }: MailPayload): Promise<void> {
  try {
    const endpoint = process.env.NOTIFY_WEBHOOK_URL;
    if (!endpoint) return; // no-op if not configured
    await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, text }) });
  } catch {
    // swallow in dev
  }
}
