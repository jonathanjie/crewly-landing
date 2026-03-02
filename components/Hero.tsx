"use client";

import { motion } from "framer-motion";
import CrewAvatar from "./CrewAvatar";

const crew = [
  { emoji: "\u{1F9D1}\u200D\u{1F4BC}", name: "Alex", role: "Ops Agent", color: "#E0FAF5" },
  { emoji: "\u{1F469}\u200D\u{1F4BB}", name: "Sam", role: "Support Agent", color: "#FEF3C7" },
  { emoji: "\u{1F9D4}", name: "Jordan", role: "Research Agent", color: "#FCE7F3" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[90dvh] md:min-h-[100dvh] flex items-center overflow-hidden pt-20">
      {/* Background blobs */}
      <div className="absolute top-20 -left-32 w-64 md:w-96 h-64 md:h-96 bg-teal/10 blob rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-48 md:w-80 h-48 md:h-80 bg-coral/8 blob-slow rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-muted/30 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 py-12 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-teal-muted/60 text-teal-deep text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-deep animate-pulse" />
              Now onboarding new crews
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink leading-[1.05] tracking-tight"
            >
              AI crew for{" "}
              <span className="doodle-underline">
                your business
                <svg viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2 8 Q50 2, 100 7 T198 5" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-5 md:mt-6 text-base md:text-xl text-ink-light leading-relaxed max-w-full md:max-w-lg"
            >
              Tell us what you need. We deploy AI agents that join your team on
              WhatsApp, Slack, Telegram — wherever your business already runs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2 bg-ink text-cream font-semibold px-6 sm:px-7 py-3.5 rounded-full hover:bg-ink/90 transition-all hover:shadow-lg hover:shadow-ink/10 text-base"
              >
                Build your crew
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
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-ink/15 text-ink font-medium px-6 sm:px-7 py-3.5 rounded-full hover:border-ink/30 hover:bg-ink/3 transition-all text-base"
              >
                See how it works
              </a>
            </motion.div>
          </div>

          {/* Right: Crew avatars arriving */}
          <div className="flex justify-center overflow-hidden">
            <div className="relative">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 300 200"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M50 100 Q100 60 150 100 T250 100"
                  stroke="#2DD4BF"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  fill="none"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                />
              </svg>

              <div className="flex gap-4 sm:gap-6 md:gap-8">
                {crew.map((member, i) => (
                  <CrewAvatar
                    key={member.name}
                    {...member}
                    delay={0.3 + i * 0.2}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IMDA GenAIxDL Funded badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-10 md:mt-20"
        >
          <a
            href="/grant-info"
            className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 text-teal-deep text-xs font-medium px-4 py-2 rounded-full hover:bg-teal/15 hover:border-teal/30 transition-all group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-deep"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            IMDA GenAIxDL Funded
            <svg
              width="10"
              height="10"
              viewBox="0 0 14 14"
              fill="none"
              className="opacity-40 group-hover:opacity-70 transition-opacity"
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
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 md:mt-10 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-8 gap-y-3 text-sm text-ink-faint"
        >
          <span>Trusted by teams at</span>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 font-[family-name:var(--font-display)] font-semibold text-ink-light/60 text-sm sm:text-base">
            <span>MarinaChain</span>
            <span className="text-ink-faint/30">/</span>
            <span>Samsung</span>
            <span className="text-ink-faint/30">/</span>
            <span>SSA</span>
            <span className="text-ink-faint/30">/</span>
            <span>DHL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
