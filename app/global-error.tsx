"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report crash to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl text-center flex flex-col gap-6">
          <div className="size-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-2xl">
            !
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-card-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected system error occurred. Our engineering team has been notified.
            </p>
          </div>
          {error?.digest && (
            <p className="text-xs font-mono text-muted-foreground/80 bg-muted/40 p-2 rounded border border-border">
              Error Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
