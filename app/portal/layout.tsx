// app/portal/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/agents", label: "My Agents" },
  { href: "/portal/deploy", label: "Deploy" },
  { href: "/portal/use-cases", label: "Use Cases" },
  { href: "/portal/grant", label: "Grant" },
  { href: "/portal/roi", label: "ROI" },
  { href: "/portal/org", label: "Org" },
  { href: "/portal/settings", label: "Settings" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu on route change (derived state, no effect needed)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/portal" className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                <div className="w-1.5 h-1.5 rounded-full bg-coral" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-deep" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-ink">
                crewly
              </span>
            </Link>

            {/* Desktop Links — hidden on mobile */}
            <div className="hidden sm:flex gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === href || (href !== "/portal" && pathname.startsWith(href))
                      ? "bg-teal/10 text-teal-deep"
                      : "text-ink-light hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user + sign out (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-light hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-xs text-ink-faint hover:text-ink-light transition-colors hidden sm:inline"
            >
              Sign out
            </button>

            {/* Hamburger — visible on mobile only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 -mr-2"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu — slides down */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-200 ease-in-out ${
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-4 border-t border-ink/5 bg-white/95 backdrop-blur-lg space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href || (href !== "/portal" && pathname.startsWith(href))
                    ? "bg-teal/10 text-teal-deep"
                    : "text-ink-light hover:text-ink hover:bg-ink/5"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-ink/5 pt-3 mt-3">
              <p className="text-xs text-ink-faint px-3 mb-2 truncate">
                {session.user.email}
              </p>
              <button
                onClick={async () => { await signOut(); router.push("/login"); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-coral-deep hover:bg-coral/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
