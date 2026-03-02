// app/portal/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/agents", label: "My Agents" },
  { href: "/portal/deploy", label: "Deploy" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

            {/* Links */}
            <div className="flex gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === href
                      ? "bg-teal/10 text-teal-deep"
                      : "text-ink-light hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user + sign out */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-light hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-xs text-ink-faint hover:text-ink-light transition-colors"
            >
              Sign out
            </button>
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
