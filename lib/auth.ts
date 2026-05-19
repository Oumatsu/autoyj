import { betterAuth } from "better-auth/minimal";
import { withCloudflare } from "better-auth-cloudflare";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";
import type { D1Database } from "@cloudflare/workers-types";

function buildAuthConfig(env?: { DB: D1Database }) {
  const hasDB = !!env?.DB;

  const cloudflareOpts = {
    d1Native: env?.DB,
    autoDetectIpAddress: false,
    geolocationTracking: false,
  };

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
        sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
          console.log(`Magic link for ${email}: ${url}`);
        },
      }),
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
