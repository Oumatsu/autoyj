"use client";

import { sanitizeDisplayData } from "@/lib/display-text";

export type PortalSessionUser = {
  role: string;
  name?: string;
};

export type PortalSessionResponse = {
  user: PortalSessionUser | null;
};

let sessionPromise: Promise<PortalSessionResponse> | null = null;

export function getPortalSession(): Promise<PortalSessionResponse> {
  if (sessionPromise) return sessionPromise;

  sessionPromise = fetch("/api/portal/session", {
    credentials: "include",
    signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(10000) : undefined,
  })
    .then(async (response) => {
      const data = (await response.json().catch(() => ({}))) as PortalSessionResponse;
      if (!response.ok) throw new Error("Unable to load portal session");
      return sanitizeDisplayData(data);
    })
    .catch((error) => {
      sessionPromise = null;
      throw error;
    });

  return sessionPromise;
}

export function invalidatePortalSession() {
  sessionPromise = null;
}
