// app/portal/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Portal Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Crewly dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          <div className="w-3 h-3 rounded-full bg-coral" />
          <div className="w-3 h-3 rounded-full bg-coral-light" />
          <div className="w-3 h-3 rounded-full bg-ink/10" />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-ink-light mb-8 leading-relaxed">
          We hit an unexpected error loading this page. This has been logged
          and our team will look into it.
        </p>

        {error.digest && (
          <p className="text-[10px] text-ink-faint mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/portal"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
