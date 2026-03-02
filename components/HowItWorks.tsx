"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    description:
      "Describe your workflow in plain language. What tasks eat up your team's time? What would you automate if you could?",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect
          x="4"
          y="6"
          width="24"
          height="20"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 13h14M9 17h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    accent: "bg-teal-muted text-teal-deep",
  },
  {
    number: "02",
    title: "We build your crew",
    description:
      "Our team configures and trains your AI agents. Custom personality, your tools, your data. Usually ready in 48 hours.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M24.5 7.5l-2.8 2.8M10.3 21.7l-2.8 2.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    accent: "bg-amber-50 text-amber-600",
  },
  {
    number: "03",
    title: "Your crew starts working",
    description:
      "Agents go live on your channels — WhatsApp, Slack, Telegram, email. They learn, adapt, and get better every week.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M8 16l5.5 5.5L24 10.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    accent: "bg-emerald-50 text-emerald-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36">
      {/* Subtle diagonal divider */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cream to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-sm font-semibold text-teal-deep uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight">
            Three steps to your crew
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-ink/5 hover:border-ink/10 transition-all hover:shadow-xl hover:shadow-ink/3 h-full">
                {/* Step number */}
                <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold text-ink/6 absolute top-6 right-8">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.accent} mb-6`}
                >
                  {step.icon}
                </div>

                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
                  {step.title}
                </h3>
                <p className="text-ink-light leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow between cards (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-5 text-ink-faint/30">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10h12m0 0l-4-4m4 4l-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
