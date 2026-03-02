// app/portal/use-cases/page.tsx
"use client";

import Link from "next/link";

interface UseCaseCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // SVG path d attribute
  templates: { name: string; slug: string; icon: string }[];
  status: "available" | "coming-soon";
}

const USE_CASES: UseCaseCategory[] = [
  {
    id: "knowledge-mining",
    name: "Knowledge Mining",
    description:
      "Transform internal documents, SOPs, and FAQs into searchable AI-powered knowledge bases. Your team gets instant answers from company knowledge.",
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    templates: [
      { name: "Knowledge Hub", slug: "knowledge-hub", icon: "\uD83D\uDCDA" },
    ],
    status: "available",
  },
  {
    id: "customer-engagement",
    name: "Customer Engagement",
    description:
      "Deploy AI chatbots on WhatsApp, Telegram, and web to handle customer inquiries, qualify leads, and provide 24/7 multichannel support.",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    templates: [
      { name: "Consumer AI", slug: "consumer-ai", icon: "\uD83D\uDCAC" },
    ],
    status: "available",
  },
  {
    id: "operations-automation",
    name: "Operations Automation",
    description:
      "Automate scheduling, logistics coordination, inventory alerts, and workflow routing. AI agents that handle the ops work your team shouldn't have to.",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
    templates: [
      { name: "Team Assistant", slug: "team-assistant", icon: "\u2699\uFE0F" },
    ],
    status: "available",
  },
  {
    id: "content-generation",
    name: "Content Generation",
    description:
      "AI-assisted report writing, marketing content, email drafts, and multilingual translations. Generate professional content at scale.",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    templates: [],
    status: "coming-soon",
  },
  {
    id: "conversational-analytics",
    name: "Conversational Analytics",
    description:
      "Analyze customer conversations, extract insights, track sentiment, and generate actionable reports from your communication channels.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    templates: [],
    status: "coming-soon",
  },
];

export default function UseCasesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-2">
          GenAIxDL Use Cases
        </h1>
        <p className="text-sm text-ink-light max-w-xl">
          IMDA&apos;s GenAI x Digital Leaders programme covers 5 AI use case categories.
          Deploy Crewly templates that map directly to each funded category.
        </p>
      </div>

      {/* IMDA funding callout */}
      <div className="bg-teal/5 border border-teal/15 rounded-2xl p-5 mb-8 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
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
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-teal-deep mb-1">
            Up to 50% co-funded by IMDA
          </p>
          <p className="text-xs text-ink-light">
            Eligible Singapore SMEs can claim up to 50% of qualifying AI deployment costs
            through the GenAIxDL grant.{" "}
            <Link href="/portal/grant" className="text-teal-deep hover:underline">
              Check your eligibility
            </Link>
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-6">
        {USE_CASES.map((category) => (
          <div
            key={category.id}
            className={`bg-white rounded-2xl border p-6 transition-all ${
              category.status === "available"
                ? "border-ink/5 hover:shadow-md hover:border-ink/10"
                : "border-ink/5 opacity-80"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Icon + name */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-deep"
                  >
                    <path d={category.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-[family-name:var(--font-display)] font-bold text-ink">
                      {category.name}
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        category.status === "available"
                          ? "bg-teal/10 text-teal-deep"
                          : "bg-ink/5 text-ink-faint"
                      }`}
                    >
                      {category.status === "available" ? "Available" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-sm text-ink-light leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Templates for this category */}
            {category.templates.length > 0 ? (
              <div className="mt-5 ml-0 sm:ml-16">
                <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-2 font-medium">
                  Available Templates
                </p>
                <div className="flex flex-wrap gap-3">
                  {category.templates.map((tpl) => (
                    <div
                      key={tpl.slug}
                      className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3 border border-ink/5"
                    >
                      <span className="text-xl">{tpl.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{tpl.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/portal/deploy/${tpl.slug}`}
                          className="text-[10px] text-ink-light hover:text-ink transition-colors"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/portal/deploy?template=${tpl.slug}`}
                          className="text-[10px] bg-teal-deep text-white px-3 py-1 rounded-lg hover:bg-teal-deep/90 transition-colors font-medium"
                        >
                          Deploy
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 ml-0 sm:ml-16">
                <div className="flex items-center gap-2 bg-ink/3 rounded-xl px-4 py-3">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink-faint"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <p className="text-xs text-ink-faint">
                    Templates for this category are in development. Stay tuned.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
