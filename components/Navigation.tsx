"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/80 backdrop-blur-xl shadow-[0_1px_0_rgba(45,45,58,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-teal group-hover:scale-110 transition-transform" />
            <div className="w-2.5 h-2.5 rounded-full bg-coral group-hover:scale-110 transition-transform delay-75" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-deep group-hover:scale-110 transition-transform delay-150" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold text-ink tracking-tight">
            crewly
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            How it works
          </a>
          <a
            href="#use-cases"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            Use cases
          </a>
          <a
            href="#pricing"
            className="text-sm text-ink-light hover:text-ink transition-colors"
          >
            Pricing
          </a>
          <a
            href="/grant-info"
            className="text-sm text-teal-deep hover:text-teal transition-colors font-medium"
          >
            Grant
          </a>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 bg-ink text-cream text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
          >
            Get started
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M1 7h12m0 0L8.5 2.5M13 7l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span
              className={`block h-0.5 bg-ink transition-all ${
                mobileOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block h-0.5 bg-ink transition-all ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 bg-ink transition-all ${
                mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-cream/95 backdrop-blur-xl border-t border-ink/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="text-ink-light hover:text-ink transition-colors"
              >
                How it works
              </a>
              <a
                href="#use-cases"
                onClick={() => setMobileOpen(false)}
                className="text-ink-light hover:text-ink transition-colors"
              >
                Use cases
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="text-ink-light hover:text-ink transition-colors"
              >
                Pricing
              </a>
              <a
                href="/grant-info"
                onClick={() => setMobileOpen(false)}
                className="text-teal-deep hover:text-teal transition-colors font-medium"
              >
                Grant
              </a>
              <a
                href="#get-started"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center bg-ink text-cream font-semibold px-5 py-3 rounded-full"
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
