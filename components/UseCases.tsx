"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatDemo from "./ChatDemo";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface UseCase {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  borderColor: string;
  emoji: string;
  agentName: string;
  chatDemo: Message[];
}

const categories = [
  { id: "all", label: "All" },
  { id: "customer-ops", label: "Customer Ops" },
  { id: "legal-finance", label: "Legal & Finance" },
  { id: "knowledge-intel", label: "Knowledge & Intel" },
  { id: "team-ops", label: "Team Ops" },
];

const useCases: (UseCase & { category: string })[] = [
  {
    category: "customer-ops",
    title: "Support L1 Deflector",
    slug: "support-l1",
    description:
      "Handles tier-1 support tickets — searches your knowledge base, drafts responses, and escalates complex issues to humans.",
    tags: ["WhatsApp", "Email", "24/7"],
    gradient: "from-teal/10 to-teal-muted/30",
    borderColor: "border-teal/15",
    emoji: "\u{1F4AC}",
    agentName: "Support Agent",
    chatDemo: [
      { role: "user", content: "Hi, I can't log into my dashboard" },
      {
        role: "agent",
        content:
          "I can help with that! Let me check your account. Could you share the email you signed up with?",
      },
      { role: "user", content: "sarah@acme.co" },
      {
        role: "agent",
        content:
          "Found it. Your password was reset 2 hours ago. I\u2019ve sent a fresh reset link to sarah@acme.co \u2014 check your inbox!",
      },
    ],
  },
  {
    category: "customer-ops",
    title: "SDR Prospector",
    slug: "sdr-prospector",
    description:
      "Researches prospects, drafts personalized outreach, and manages pipeline follow-ups to fill your calendar.",
    tags: ["CRM", "Research", "Email"],
    gradient: "from-pink-50/80 to-rose-50/50",
    borderColor: "border-pink-200/30",
    emoji: "\u{1F3AF}",
    agentName: "Sales Agent",
    chatDemo: [
      { role: "user", content: "Research Acme Corp for our outreach" },
      {
        role: "agent",
        content:
          "Acme Corp: 120 employees, Series B ($24M), shipping logistics. CTO is James Wu \u2014 he posted about automating warehouse ops last week.",
      },
      { role: "user", content: "Draft an email to James" },
      {
        role: "agent",
        content:
          'Done! Subject: "Automating warehouse ops \u2014 saw your post." Personalized around their recent hiring spree and his automation interests. Want me to send?',
      },
    ],
  },
  {
    category: "legal-finance",
    title: "Contract Intelligence",
    slug: "contract-intel",
    description:
      "Analyzes contracts, extracts key terms, flags risks, and tracks obligations so nothing slips through the cracks.",
    tags: ["Docs", "Drive", "Alerts"],
    gradient: "from-violet-50/80 to-indigo-50/50",
    borderColor: "border-violet-200/30",
    emoji: "\u{1F4DC}",
    agentName: "Legal Agent",
    chatDemo: [
      { role: "user", content: "Review the new vendor contract in Drive" },
      {
        role: "agent",
        content:
          "Reviewed. Found 3 flags: (1) auto-renewal clause with 90-day notice, (2) uncapped liability in Section 7.2, (3) non-compete extends 24 months post-termination.",
      },
      { role: "user", content: "What's the payment terms?" },
      {
        role: "agent",
        content:
          "Net-60 with 2% early payment discount. Invoice within 5 business days of delivery. Late fees: 1.5%/month.",
      },
    ],
  },
  {
    category: "legal-finance",
    title: "Finance Ops",
    slug: "finance-ops",
    description:
      "Processes invoices, reconciles expenses, and generates financial reports to keep your books clean.",
    tags: ["QuickBooks", "Slack", "Reports"],
    gradient: "from-emerald-50/80 to-green-50/50",
    borderColor: "border-emerald-200/30",
    emoji: "\u{1F4B0}",
    agentName: "Finance Agent",
    chatDemo: [
      { role: "user", content: "What's our burn rate this month?" },
      {
        role: "agent",
        content:
          "March burn: $47.2K (up 8% from Feb). Biggest increase: cloud infra at $12.1K (+$2.3K from new staging env).",
      },
      { role: "user", content: "Flag anything unusual" },
      {
        role: "agent",
        content:
          "Two items: (1) duplicate $890 charge from Notion \u2014 likely a billing error, (2) unreconciled $3,200 wire from Feb 28. Want me to investigate both?",
      },
    ],
  },
  {
    category: "knowledge-intel",
    title: "Knowledge Brain",
    slug: "knowledge-brain",
    description:
      "Curates, organizes, and retrieves company knowledge across Notion, Confluence, Drive, and more. Your company brain that never forgets.",
    tags: ["Notion", "Confluence", "Search"],
    gradient: "from-amber-50/80 to-yellow-50/50",
    borderColor: "border-amber-200/30",
    emoji: "\u{1F9E0}",
    agentName: "Knowledge Agent",
    chatDemo: [
      {
        role: "user",
        content: "What's our refund policy for enterprise clients?",
      },
      {
        role: "agent",
        content:
          "Per the Enterprise SLA (updated Jan 2026): full refund within 30 days, pro-rata after. Enterprise clients get a dedicated CSM to handle refund requests. Doc: Notion > Policies > Enterprise SLA v3.2",
      },
      { role: "user", content: "Who last updated that?" },
      {
        role: "agent",
        content:
          "Last edited by Maya R. on Jan 14, 2026. Previous version (v3.1) had a 14-day window \u2014 extended to 30 in the latest revision.",
      },
    ],
  },
  {
    category: "legal-finance",
    title: "Compliance Monitor",
    slug: "compliance-monitor",
    description:
      "Monitors regulatory compliance, tracks policy changes, and generates audit reports automatically.",
    tags: ["Alerts", "Audit", "Reports"],
    gradient: "from-red-50/80 to-orange-50/50",
    borderColor: "border-red-200/30",
    emoji: "\u{1F6E1}\uFE0F",
    agentName: "Compliance Agent",
    chatDemo: [
      { role: "user", content: "Any new GDPR updates this week?" },
      {
        role: "agent",
        content:
          "Yes \u2014 EU issued new guidance on AI-generated profiling (March 1). Affects our recommendation engine. I've flagged it for legal review and drafted a compliance checklist.",
      },
      { role: "user", content: "Send the checklist to the team" },
      {
        role: "agent",
        content:
          "Sent to #compliance on Slack with a 2-week deadline. 6 items, 3 require engineering changes. Want me to create Jira tickets?",
      },
    ],
  },
  {
    category: "knowledge-intel",
    title: "Market Research",
    slug: "market-research",
    description:
      "Tracks market trends, competitors, and industry news to surface strategic insights before your competitors do.",
    tags: ["Web", "Reports", "Slack"],
    gradient: "from-sky-50/80 to-cyan-50/50",
    borderColor: "border-sky-200/30",
    emoji: "\u{1F50D}",
    agentName: "Research Agent",
    chatDemo: [
      { role: "user", content: "What's our main competitor up to?" },
      {
        role: "agent",
        content:
          "CompetitorX launched a new enterprise tier last Tuesday at $499/mo. They\u2019re targeting mid-market with a 'white-glove onboarding' pitch. 3 LinkedIn posts, 47 reactions. No major press coverage yet.",
      },
      { role: "user", content: "How does their pricing compare to ours?" },
      {
        role: "agent",
        content:
          "Their $499 maps to our Growth plan ($79 early bird). Feature parity is ~80%, but they lack multi-channel and custom integrations. We\u2019re significantly cheaper with more flexibility.",
      },
    ],
  },
  {
    category: "team-ops",
    title: "HR Onboarding",
    slug: "hr-onboarding",
    description:
      "Guides new hires through onboarding checklists, answers policy questions, and tracks completion \u2014 so nobody falls through the cracks.",
    tags: ["Slack", "Notion", "Checklists"],
    gradient: "from-fuchsia-50/80 to-pink-50/50",
    borderColor: "border-fuchsia-200/30",
    emoji: "\u{1F91D}",
    agentName: "HR Agent",
    chatDemo: [
      { role: "user", content: "New hire starting Monday: Alex Chen, Engineering" },
      {
        role: "agent",
        content:
          "Got it! I\u2019ve created Alex\u2019s onboarding checklist: (1) IT setup, (2) Slack channels, (3) 1:1 with manager, (4) security training, (5) benefits enrollment. Sending welcome message Monday 9am.",
      },
      { role: "user", content: "Add a meeting with the CTO on day 2" },
      {
        role: "agent",
        content:
          "Added: 30-min intro with CTO on Tuesday at 2pm. Calendar invite sent to both. Alex\u2019s checklist is now 6 items. All on track!",
      },
    ],
  },
  {
    category: "team-ops",
    title: "Project Manager",
    slug: "project-manager",
    description:
      "Tracks project tasks, generates status reports, and keeps team communication flowing across tools.",
    tags: ["Jira", "Slack", "Reports"],
    gradient: "from-blue-50/80 to-indigo-50/50",
    borderColor: "border-blue-200/30",
    emoji: "\u{1F4CB}",
    agentName: "PM Agent",
    chatDemo: [
      { role: "user", content: "Status update on the mobile app project?" },
      {
        role: "agent",
        content:
          "Sprint 4: 8/12 stories done, 3 in review, 1 blocked (API dependency on backend team). On track for March 15 milestone. Velocity: 34 pts (avg: 31).",
      },
      { role: "user", content: "What's blocking the API story?" },
      {
        role: "agent",
        content:
          "Backend auth endpoint isn\u2019t deployed yet \u2014 David K. is owner, ETA Wednesday. I\u2019ve pinged him on Slack and added a flag to tomorrow\u2019s standup.",
      },
    ],
  },
  {
    category: "team-ops",
    title: "Maritime Ops",
    slug: "maritime-ops",
    description:
      "Monitors vessel operations, bunker procurement, and maritime compliance for shipping companies.",
    tags: ["Telegram", "Compliance", "Docs"],
    gradient: "from-teal/8 to-cyan-50/50",
    borderColor: "border-teal/12",
    emoji: "\u2693",
    agentName: "Maritime Agent",
    chatDemo: [
      { role: "user", content: "BDN for MV Pacific Star arrived" },
      {
        role: "agent",
        content:
          "Processing BDN... Vessel: MV Pacific Star, Port: Singapore, Fuel: VLSFO 380cst, Qty: 1,200 MT, Supplier: Global Petro. Sulphur content: 0.42% \u2014 within IMO 2020 limits.",
      },
      { role: "user", content: "Compare price with last delivery" },
      {
        role: "agent",
        content:
          "Current: $548/MT vs last delivery (Feb 14): $562/MT. That\u2019s $14/MT cheaper, saving ~$16,800 on this order. Market trend is down 2.5% this week.",
      },
    ],
  },
];

export default function UseCases() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? useCases
      : useCases.filter((c) => c.category === activeCategory);

  const activeCaseData = useCases.find((c) => c.slug === activeCase);

  return (
    <section id="use-cases" className="relative py-28 md:py-36 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold text-coral uppercase tracking-widest mb-3">
            Use cases
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-ink tracking-tight">
            Every team needs a crew
          </h2>
          <p className="mt-4 text-ink-light text-lg max-w-xl mx-auto">
            From customer support to compliance — pick the agents that match
            your workflow.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveCase(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-ink text-cream shadow-sm"
                  : "bg-ink/5 text-ink-light hover:bg-ink/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((c) => (
                <motion.button
                  key={c.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() =>
                    setActiveCase(activeCase === c.slug ? null : c.slug)
                  }
                  className={`text-left relative rounded-2xl p-6 bg-gradient-to-br ${c.gradient} border ${c.borderColor} transition-all group overflow-hidden ${
                    activeCase === c.slug
                      ? "ring-2 ring-teal shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <span className="absolute top-4 right-5 text-3xl opacity-[0.12] group-hover:opacity-[0.18] transition-opacity select-none">
                    {c.emoji}
                  </span>

                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-2 relative">
                    {c.title}
                  </h3>
                  <p className="text-sm text-ink-light leading-relaxed mb-4 relative line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 relative">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/60 text-ink-light border border-ink/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Click hint */}
                  <span className="absolute bottom-4 right-5 text-[11px] text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to demo
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat demo panel */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                {activeCaseData ? (
                  <motion.div
                    key={activeCaseData.slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatDemo
                      messages={activeCaseData.chatDemo}
                      agentName={activeCaseData.agentName}
                      agentEmoji={activeCaseData.emoji}
                      isActive={true}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[320px] rounded-2xl border-2 border-dashed border-ink/8 flex flex-col items-center justify-center gap-3 text-ink-faint"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      className="text-ink/10"
                    >
                      <path
                        d="M16 28a12 12 0 1 0-10-5.4L4 28l5.4-2A11.95 11.95 0 0 0 16 28Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 16h.01M16 16h.01M22 16h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-sm">Click a use case to see it in action</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
