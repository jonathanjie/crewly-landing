"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    originalPrice: "$299",
    price: "$29",
    period: "/mo",
    description: "One AI crew member for your team",
    features: [
      "1 AI agent",
      "1 channel (WhatsApp, Slack, or Telegram)",
      "Standard response time",
      "Weekly performance reports",
      "Email support",
    ],
    cta: "Start with one",
    popular: false,
    style: "bg-white border-ink/8 hover:border-ink/15",
  },
  {
    name: "Growth",
    originalPrice: "$799",
    price: "$79",
    period: "/mo",
    description: "A small crew that covers your bases",
    features: [
      "Up to 3 AI agents",
      "Unlimited channels",
      "Priority response time",
      "Custom agent personalities",
      "Integrations (CRM, Notion, Drive)",
      "Dedicated onboarding call",
    ],
    cta: "Build your crew",
    popular: true,
    style:
      "bg-gradient-to-br from-ink to-dark text-cream border-transparent shadow-2xl shadow-ink/15",
  },
  {
    name: "Scale",
    originalPrice: "",
    price: "Custom",
    period: "",
    description: "For teams that need more firepower",
    features: [
      "Unlimited agents",
      "All channels + custom integrations",
      "Fastest response time",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom training & data pipelines",
    ],
    cta: "Talk to us",
    popular: false,
    style: "bg-white border-ink/8 hover:border-ink/15",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-28 md:py-36 bg-cream-warm/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal/5 blob rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-sm font-semibold text-teal-deep uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-ink-light text-lg max-w-lg mx-auto">
            No hidden fees. No per-message charges. Just a flat monthly rate for
            your crew.
          </p>

          {/* Early bird banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 bg-coral/10 text-coral-deep px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1v6l3 3M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Early bird pricing — 90% off for founding teams
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-3xl p-6 sm:p-8 md:p-10 border transition-all ${plan.style} ${
                plan.popular ? "md:-mt-4 md:mb-0" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most popular
                </span>
              )}

              <p
                className={`font-[family-name:var(--font-display)] text-lg font-bold ${
                  plan.popular ? "text-cream" : "text-ink"
                }`}
              >
                {plan.name}
              </p>

              <div className="mt-4">
                {/* Original price — struck through */}
                {plan.originalPrice && (
                  <span
                    className={`text-lg line-through ${
                      plan.popular ? "text-cream/30" : "text-ink-faint"
                    }`}
                  >
                    {plan.originalPrice}
                    {plan.period}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight ${
                      plan.popular ? "text-cream" : "text-ink"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-lg ${
                        plan.popular ? "text-cream/60" : "text-ink-light"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <p
                className={`mt-2 text-sm ${
                  plan.popular ? "text-cream/70" : "text-ink-light"
                }`}
              >
                {plan.description}
              </p>

              <hr
                className={`my-6 ${
                  plan.popular ? "border-cream/10" : "border-ink/8"
                }`}
              />

              <ul className="space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.popular ? "text-teal-light" : "text-teal-deep"
                      }`}
                    >
                      <path
                        d="M4 9.5l3.5 3.5L14 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className={
                        plan.popular ? "text-cream/80" : "text-ink-light"
                      }
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#get-started"
                className={`mt-8 w-full inline-flex items-center justify-center font-semibold px-6 py-3.5 rounded-full transition-all text-sm ${
                  plan.popular
                    ? "bg-cream text-ink hover:bg-cream/90"
                    : "bg-ink text-cream hover:bg-ink/90"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-ink-faint mt-8">
          Early bird pricing locked for 12 months after signup. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
