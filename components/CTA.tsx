"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section id="get-started" className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-dark to-dark-surface" />

      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-teal/10 blob rounded-full blur-[100px]" />
      <div className="absolute bottom-10 -right-10 w-60 h-60 bg-coral/10 blob-slow rounded-full blur-[80px]" />

      {/* Floating crew dots */}
      <motion.div
        className="absolute top-16 left-[15%] w-3 h-3 rounded-full bg-teal/40"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-32 right-[20%] w-2 h-2 rounded-full bg-coral/40"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute bottom-24 left-[25%] w-2.5 h-2.5 rounded-full bg-teal-light/30"
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Crew dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-teal" />
            <div className="w-3 h-3 rounded-full bg-coral" />
            <div className="w-3 h-3 rounded-full bg-teal-deep" />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-extrabold text-cream tracking-tight leading-tight">
            Ready to build
            <br />
            your crew?
          </h2>
          <p className="mt-6 text-lg md:text-xl text-cream/60 max-w-lg mx-auto leading-relaxed">
            Tell us about your business. We&apos;ll design your crew, set
            everything up, and have your first agent live within 48 hours.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://cal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-cream text-ink font-semibold px-8 py-4 rounded-full hover:bg-cream/90 transition-all hover:shadow-lg hover:shadow-cream/10 text-base"
            >
              Book a call
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10m0 0L9 4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="mailto:hello@crewly.ai"
              className="inline-flex items-center justify-center gap-2 border border-cream/20 text-cream/80 font-medium px-8 py-4 rounded-full hover:border-cream/40 hover:text-cream transition-all text-base"
            >
              hello@crewly.ai
            </a>
          </div>

          <p className="mt-8 text-sm text-cream/30">
            No commitment. No credit card. Just a conversation.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
