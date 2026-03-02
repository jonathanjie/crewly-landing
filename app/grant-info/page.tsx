// app/grant-info/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GenAIxDL Grant — Up to 50% Funded by IMDA | Crewly",
  description:
    "Check if your business qualifies for IMDA's GenAI x Digital Leaders grant. Up to 50% co-funding for AI adoption in non-ICT industries.",
};

const USE_CASE_CATEGORIES = [
  {
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    title: "Knowledge Management",
    desc: "Internal knowledge bases, FAQ bots, document search and summarization powered by AI.",
    examples: "SOPs lookup, policy Q&A, onboarding assistant",
  },
  {
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    title: "Customer Engagement",
    desc: "AI-powered chatbots for customer support, lead qualification, and multichannel communication.",
    examples: "WhatsApp support bot, lead nurture, service desk",
  },
  {
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
    title: "Operations Automation",
    desc: "Automate scheduling, logistics coordination, inventory management, and workflow routing.",
    examples: "Shipping ops, inventory alerts, approval workflows",
  },
  {
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    title: "Content Generation",
    desc: "AI-assisted report writing, marketing content, email drafts, and multilingual translations.",
    examples: "Weekly reports, social posts, translated docs",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "Compliance & Analytics",
    desc: "Regulatory compliance monitoring, data dashboards, risk assessment, and audit trail generation.",
    examples: "MAS compliance, ESG reports, anomaly detection",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: "Check Eligibility",
    desc: "Use our free checker tool to verify your company qualifies — non-ICT SSIC, registered in Singapore.",
  },
  {
    num: "02",
    title: "Choose Use Cases",
    desc: "Select from 5 GenAI categories. Our team helps scope the right AI agents for your workflows.",
  },
  {
    num: "03",
    title: "Deploy with Crewly",
    desc: "We build and deploy your AI crew. Grant covers up to 50% of qualifying costs.",
  },
  {
    num: "04",
    title: "Measure ROI",
    desc: "Track hours saved, costs reduced, and productivity gains through your Crewly dashboard.",
  },
];

export default function GrantInfoPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-xl border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-teal group-hover:scale-110 transition-transform" />
              <div className="w-2.5 h-2.5 rounded-full bg-coral group-hover:scale-110 transition-transform delay-75" />
              <div className="w-2.5 h-2.5 rounded-full bg-teal-deep group-hover:scale-110 transition-transform delay-150" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-ink tracking-tight">
              crewly
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-ink-light hover:text-ink transition-colors">
              Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-ink text-cream text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal/10 rounded-full blur-3xl blob" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-coral/10 rounded-full blur-3xl blob-slow" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal-deep text-sm font-medium px-4 py-2 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            IMDA GenAIxDL Programme
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-ink mb-6 leading-tight">
            Up to{" "}
            <span className="text-teal-deep">50% funded</span>
            {" "}AI adoption for your business
          </h1>

          <p className="text-lg text-ink-light max-w-2xl mx-auto mb-10">
            Singapore&apos;s GenAI x Digital Leaders programme helps non-ICT companies deploy AI agents
            with government co-funding. Crewly is your approved technology partner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-teal-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-teal-deep/90 transition-colors text-sm"
            >
              Check your eligibility
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12m0 0L8.5 2.5M13 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="https://www.imda.gov.sg/how-we-can-help/smes-go-digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-light hover:text-ink transition-colors underline underline-offset-4"
            >
              Learn more on IMDA
            </a>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-ink mb-3 text-center">
            Who is eligible?
          </h2>
          <p className="text-ink-light text-center mb-12 max-w-lg mx-auto">
            The GenAIxDL grant targets Singapore-registered non-ICT businesses looking to adopt AI.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-teal/20 bg-teal/5 p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-teal-deep mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                You qualify if
              </h3>
              <ul className="space-y-3 text-sm text-ink-light">
                <li className="flex items-start gap-2">
                  <span className="text-teal-deep mt-0.5">+</span>
                  Registered and operating in Singapore
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-deep mt-0.5">+</span>
                  SSIC code NOT in ICT sector (61, 62, 63)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-deep mt-0.5">+</span>
                  SME: up to 200 employees or S$100M turnover = <strong>50% funding</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-deep mt-0.5">+</span>
                  Non-SME enterprises also eligible at <strong>30% funding</strong>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-coral-deep mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Not eligible if
              </h3>
              <ul className="space-y-3 text-sm text-ink-light">
                <li className="flex items-start gap-2">
                  <span className="text-coral-deep mt-0.5">-</span>
                  SSIC code starts with 61 (Telecommunications)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-deep mt-0.5">-</span>
                  SSIC code starts with 62 (IT / Software)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-deep mt-0.5">-</span>
                  SSIC code starts with 63 (Information Services)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-deep mt-0.5">-</span>
                  Not registered in Singapore
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Categories */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-ink mb-3 text-center">
            5 GenAI Use Case Categories
          </h2>
          <p className="text-ink-light text-center mb-12 max-w-lg mx-auto">
            Deploy AI agents across these approved categories to qualify for grant funding.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASE_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl border border-ink/5 p-6 hover:shadow-md hover:border-ink/10 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-deep"
                  >
                    <path d={cat.icon} />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-ink-light mb-3">{cat.desc}</p>
                <p className="text-[10px] text-ink-faint">
                  e.g. {cat.examples}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-ink mb-12 text-center">
            How it works
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center">
                  <span className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-deep">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-ink mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-ink rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-coral/20 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-cream mb-4">
                Ready to get funded?
              </h2>
              <p className="text-cream/70 mb-8 max-w-md mx-auto">
                Sign up for Crewly, check your eligibility, and start deploying AI agents
                with up to 50% government co-funding.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-teal text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-teal-light transition-colors text-sm"
                >
                  Get started free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12m0 0L8.5 2.5M13 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/#pricing"
                  className="text-sm text-cream/70 hover:text-cream transition-colors underline underline-offset-4"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/5 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal" />
              <div className="w-1.5 h-1.5 rounded-full bg-coral" />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-deep" />
            </div>
            <span className="text-xs text-ink-faint">crewly.chat</span>
          </div>
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} Crewly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
