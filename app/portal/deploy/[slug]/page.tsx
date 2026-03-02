// app/portal/deploy/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AppTemplate } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

/** Map categories to integration blocks typically required. */
const categoryIntegrations: Record<string, string[]> = {
  "knowledge-intel": ["Document storage (Google Drive / SharePoint)", "Internal knowledge base (Notion / Confluence)"],
  "customer-ops": ["WhatsApp Business", "Telegram Bot", "Email (SMTP)", "CRM (HubSpot)"],
  "team-ops": ["Slack / Teams", "Jira / Project management", "Calendar API"],
  "legal-finance": ["Document management", "QuickBooks / Accounting", "Compliance databases"],
  "content-generation": ["CMS or publishing platform", "Brand asset library"],
};

export default function TemplateDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [template, setTemplate] = useState<AppTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const templates = await api.listTemplates();
        const found = templates.find((t) => t.slug === slug);
        if (found) {
          setTemplate(found);
        } else {
          setError("Template not found");
        }
      } catch {
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ink/5 rounded-xl w-48" />
          <div className="h-64 bg-white rounded-2xl border border-ink/5" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-coral-deep text-sm mb-2">{error ?? "Template not found"}</p>
        <button
          onClick={() => router.push("/portal/deploy")}
          className="text-teal-deep text-sm mt-2 hover:underline"
        >
          &larr; Back to templates
        </button>
      </div>
    );
  }

  const integrations = categoryIntegrations[template.category] ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-ink-faint mb-6">
        <Link href="/portal/deploy" className="hover:text-ink transition-colors">
          Deploy
        </Link>
        <span>/</span>
        <span className="text-ink">{template.name}</span>
      </div>

      {/* Template header card */}
      <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-3xl flex-shrink-0">
            {template.icon || "\uD83E\uDD16"}
          </div>
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-1">
              {template.name}
            </h1>
            {template.category && (
              <span className="text-[10px] inline-block px-2 py-0.5 rounded-full bg-ink/5 text-ink-faint">
                {categoryLabels[template.category] ?? template.category}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-ink-light leading-relaxed mb-6">
          {template.description}
        </p>

        <Link
          href={`/portal/deploy?template=${template.slug}`}
          className="inline-flex items-center gap-2 bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
        >
          Deploy this template
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 7h12m0 0L8.5 2.5M13 7l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Default skills */}
      <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-4">
          Default Skills
        </h2>
        {template.default_skills && template.default_skills.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-2">
            {template.default_skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 p-3 rounded-xl bg-teal/5 border border-teal/10"
              >
                <span className="text-teal-deep text-sm">{"\u2726"}</span>
                <span className="text-sm text-ink font-medium">{skill}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-light">
            This template includes a default skill set that will be configured during deployment.
          </p>
        )}
      </div>

      {/* Integrations */}
      {integrations.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-4">
            Integration Blocks
          </h2>
          <p className="text-xs text-ink-light mb-4">
            These integrations are typically used with this template. You can configure them after deployment.
          </p>
          <div className="space-y-2">
            {integrations.map((integration) => (
              <div
                key={integration}
                className="flex items-center gap-3 p-3 rounded-xl bg-ink/3"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink-faint flex-shrink-0"
                >
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                <span className="text-sm text-ink">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config schema preview */}
      {(() => {
        const schema = template.config_schema as Record<string, unknown> | undefined;
        const props = schema?.properties as Record<string, Record<string, string>> | undefined;
        if (!props || Object.keys(props).length === 0) return null;
        return (
          <div className="bg-white rounded-2xl border border-ink/5 p-6">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-4">
              Configuration Options
            </h2>
            <p className="text-xs text-ink-light mb-4">
              These settings can be customized during the deployment wizard.
            </p>
            <div className="space-y-2">
              {Object.entries(props).map(([key, prop]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-ink/3">
                  <span className="text-sm text-ink font-medium">{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  <span className="text-xs text-ink-faint">{prop?.type ?? "text"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
