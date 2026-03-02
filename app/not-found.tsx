// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="text-center max-w-md mx-auto">
        {/* Crewly dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          <div className="w-3 h-3 rounded-full bg-teal" />
          <div className="w-3 h-3 rounded-full bg-coral" />
          <div className="w-3 h-3 rounded-full bg-teal-deep" />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-6xl font-bold text-ink mb-2">
          404
        </h1>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
          Page not found
        </h2>
        <p className="text-sm text-ink-light mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/portal"
            className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
