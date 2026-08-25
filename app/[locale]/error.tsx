"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report nested route crash to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-foreground antialiased">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0f172a] p-8 shadow-2xl text-center flex flex-col gap-6 text-white">
        <div className="size-14 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-500/20">
          !
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-400">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
        </div>
        {error?.digest && (
          <p className="text-xs font-mono text-slate-500 bg-slate-900/80 p-2 rounded border border-white/10">
            Digest: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-gold text-slate-950 font-bold hover:bg-gold/90 transition-colors shadow-sm text-xs uppercase tracking-wider"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-white/15 text-slate-300 font-bold hover:bg-white/5 hover:text-white transition-colors text-xs uppercase tracking-wider inline-flex items-center justify-center"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
