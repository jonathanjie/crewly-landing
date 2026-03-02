"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "We replaced a 3-person support queue with one Crewly agent on WhatsApp. Response time went from 4 hours to 4 seconds.",
    name: "Sarah L.",
    title: "COO, Logistics Startup",
    avatar: "\u{1F469}\u200D\u{1F4BC}",
  },
  {
    quote:
      "Our Crewly agent handles 80% of vendor inquiries on Telegram. My team finally has time to focus on growth.",
    name: "David K.",
    title: "Founder, E-commerce Brand",
    avatar: "\u{1F468}\u200D\u{1F4BB}",
  },
  {
    quote:
      "The onboarding was ridiculously easy. We described what we needed, and two days later our agent was live on Slack.",
    name: "Maya R.",
    title: "Head of Ops, Consulting Firm",
    avatar: "\u{1F469}\u200D\u{1F3EB}",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-ink tracking-tight">
            Teams love their crew
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-cream-warm/40 rounded-3xl p-6 sm:p-8 border border-ink/4 relative"
            >
              {/* Quote mark */}
              <span className="absolute top-6 right-8 font-[family-name:var(--font-display)] text-5xl text-ink/5 select-none">
                &ldquo;
              </span>

              <p className="text-ink/80 leading-relaxed relative">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-[family-name:var(--font-display)] font-semibold text-sm text-ink">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-light">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
