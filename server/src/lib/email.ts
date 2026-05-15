import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config.js";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

// ---- Dev / console provider ----
// Logs to console AND writes a file at server/dev-emails/<timestamp>-<to>.html
// so you can click verification links during local development.
class ConsoleEmailProvider implements EmailProvider {
  private dir = path.resolve("dev-emails");

  async send(message: EmailMessage): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const safeTo = message.to.replace(/[^a-zA-Z0-9._-]/g, "_");
    const file = path.join(this.dir, `${ts}-${safeTo}.html`);
    await fs.writeFile(file, message.html, "utf8");

    /* eslint-disable no-console */
    console.log("\n=== [DEV EMAIL] ===");
    console.log(`To:      ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`File:    ${file}`);
    console.log(`Text:\n${message.text}`);
    console.log("===================\n");
    /* eslint-enable no-console */
  }
}

// ---- Resend (stub for future) ----
// Wire up here when you add `npm i resend` in production.
class ResendEmailProvider implements EmailProvider {
  async send(_message: EmailMessage): Promise<void> {
    throw new Error(
      "Resend provider not implemented yet. Install `resend` package and wire it up in server/src/lib/email.ts.",
    );
  }
}

function buildProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "resend":
      return new ResendEmailProvider();
    case "sendgrid":
      throw new Error("SendGrid provider not implemented yet.");
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}

export const emailProvider: EmailProvider = buildProvider();

// ---- Templates ----

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${env.APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await emailProvider.send({
    to,
    subject: "Verify your unigig email",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h1 style="margin:0 0 16px;">Welcome to unigig, ${escapeHtml(name)}.</h1>
        <p>Confirm your email address to activate your account.</p>
        <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Verify email</a></p>
        <p style="color:#666;font-size:13px;margin-top:24px;">Or paste this URL into your browser:<br/>${url}</p>
      </div>
    `,
    text: `Welcome to unigig, ${name}.\n\nVerify your email: ${url}\n`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
