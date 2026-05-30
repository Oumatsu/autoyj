import { betterAuth } from "better-auth/minimal";
import { withCloudflare } from "better-auth-cloudflare";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { dash } from "@better-auth/infra";
import type { D1Database } from "@cloudflare/workers-types";

function buildAuthConfig(env?: { DB: D1Database }) {
  const hasDB = !!env?.DB;

  const cloudflareOpts = {
    d1Native: env?.DB,
    autoDetectIpAddress: false,
    geolocationTracking: false,
  };

  const resendApiKey = process.env.RESEND_API_KEY || "";

  const authOpts: Record<string, unknown> = {
    appName: "autoYJ",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET || "better-auth-secret-change-me-32chars-min",
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
    emailAndPassword: { enabled: false },
    socialProviders: {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || "",
        clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID || "",
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      },
      wechat: {
        clientId: process.env.WECHAT_APP_ID || "",
        clientSecret: process.env.WECHAT_APP_SECRET || "",
      } as any,
    },
    plugins: [
      passkey({
        rpID: process.env.PASSKEY_RP_ID || "localhost",
        rpName: "autoYJ",
        origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      }),
      magicLink({
        sendMagicLink: async ({ email, token, url, metadata }, ctx) => {
          if (!resendApiKey) {
            console.log(`[DEV] Magic link for ${email}:\nToken: ${token}\nURL: ${url}`);
            return;
          }
          const resend = new Resend(resendApiKey);
          const { error } = await resend.emails.send({
            from: "autoYJ <auth@autoyj.com>",
            to: email,
            subject: "Sign in to autoYJ",
            html: [
              `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">`,
              `<h1 style="color:#c5a059;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;">auto<span style="color:#d4af37">YJ</span></h1>`,
              `<p style="color:#d1d5db;font-size:16px;line-height:1.6;">Click the button below to sign in to your autoYJ account. This link is valid for 10 minutes.</p>`,
              `<a href="${url}" style="display:inline-block;background:#c5a059;color:#000;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;text-transform:uppercase;font-size:13px;letter-spacing:0.1em;margin-top:8px;">Sign In →</a>`,
              `<p style="color:#6b7280;font-size:12px;margin-top:24px;line-height:1.5;">If you didn't request this email, you can safely ignore it.</p>`,
              `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin-top:24px;" />`,
              `<p style="color:#4b5563;font-size:11px;">autoYJ — China EV export partner for African dealers</p>`,
              `</div>`,
            ].join("\n"),
          });
          if (error) {
            console.error("Resend sendMagicLink error:", error);
          }
        },
      }),
      dash(),
    ],
  };

  if (hasDB) {
    return betterAuth(withCloudflare(cloudflareOpts, authOpts) as any);
  }

  return betterAuth(authOpts as any);
}

let _auth: ReturnType<typeof buildAuthConfig> | null = null;

export function getAuth(env?: { DB: D1Database }) {
  if (!_auth) {
    _auth = buildAuthConfig(env);
  }
  return _auth;
}

export const auth = getAuth();
