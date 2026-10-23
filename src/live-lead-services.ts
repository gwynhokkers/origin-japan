import type { LeadMail, LeadServices } from "./lead-services";

/** Cloudflare's dummy keys. They pass siteverify without a Turnstile account. */
const devSiteKey = "1x00000000000000000000AA";
const devSecret = "1x0000000000000000000000000000000AA";

export async function liveLeadServices(): Promise<LeadServices> {
  const configuredSiteKey = await readEnv("TURNSTILE_SITE_KEY");
  const configuredSecret = await readEnv("TURNSTILE_SECRET_KEY");
  const siteKey = configuredSiteKey || (import.meta.env.DEV ? devSiteKey : undefined);
  const secret = configuredSecret || (import.meta.env.DEV ? devSecret : undefined);

  return {
    siteKey,
    async checkSpam(token) {
      if (!secret || !token) return false;
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      });
      if (!response.ok) return false;
      const result = (await response.json()) as { success?: boolean };
      return result.success === true;
    },
    sendEmail: sendLeadEmail,
  };
}

async function sendLeadEmail(mail: LeadMail): Promise<void> {
  const key = await readEnv("RESEND_API_KEY");
  if (!key) throw new Error("Email is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: "Origin Japan <info@originjapan.co.uk>",
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
    }),
  });
  if (!response.ok) throw new Error(`Email was not accepted (${response.status})`);
}

async function readEnv(name: string): Promise<string | undefined> {
  const fromProcess = typeof process !== "undefined" ? process.env[name]?.trim() : "";
  if (fromProcess) return fromProcess;
  try {
    const workers = (await import("cloudflare:workers")) as unknown as { env?: Record<string, unknown> };
    const value = workers.env?.[name];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}
