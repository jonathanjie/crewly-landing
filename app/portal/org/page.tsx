// app/portal/org/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Org, OrgMember } from "@/lib/types";
import { planLabels, planColors } from "@/lib/types";

export default function OrgPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const o = await api.listOrgs();
        setOrgs(o);
        if (o.length > 0) setSelectedOrg(o[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch members when selected org changes
  useEffect(() => {
    if (!selectedOrg) return;
    setMembersLoading(true);
    setMembersError(null);
    setMembers([]);

    (async () => {
      try {
        const m = await api.getOrgMembers(selectedOrg.slug);
        setMembers(m);
      } catch {
        // Endpoint may not exist yet — gracefully degrade
        setMembersError("Member list is not available yet.");
      } finally {
        setMembersLoading(false);
      }
    })();
  }, [selectedOrg]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      await api.inviteOrgMember(selectedOrg.slug, inviteEmail);
      setInviteSuccess(true);
      setInviteEmail("");
      // Re-fetch members
      const m = await api.getOrgMembers(selectedOrg.slug);
      setMembers(m);
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invite"
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const roleBadge = (role: OrgMember["role"]) => {
    const styles: Record<OrgMember["role"], string> = {
      owner: "bg-coral/10 text-coral-deep",
      admin: "bg-teal/10 text-teal-deep",
      member: "bg-ink/5 text-ink-light",
    };
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${styles[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
        Organization
      </h1>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-32" />
          <div className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-48" />
        </div>
      ) : error ? (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      ) : orgs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/5 p-12 text-center">
          <p className="text-3xl mb-3">🏢</p>
          <p className="text-ink-light text-sm">
            No organization found. Deploy an agent to create one automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Org selector (if multiple) */}
          {orgs.length > 1 && (
            <div className="flex gap-2">
              {orgs.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrg(o)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedOrg?.id === o.id
                      ? "bg-teal/10 text-teal-deep border border-teal/20"
                      : "bg-white border border-ink/5 text-ink-light hover:bg-ink/5"
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          )}

          {selectedOrg && (
            <>
              {/* Org Details Card */}
              <section className="bg-white rounded-2xl border border-ink/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                      {selectedOrg.name}
                    </h2>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Slug: {selectedOrg.slug}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${planColors[selectedOrg.plan_tier]}`}>
                    {planLabels[selectedOrg.plan_tier]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-cream rounded-xl p-4">
                    <p className="text-xs text-ink-light mb-1">Plan</p>
                    <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink capitalize">
                      {selectedOrg.plan_tier}
                    </p>
                  </div>
                  <div className="bg-cream rounded-xl p-4">
                    <p className="text-xs text-ink-light mb-1">Members</p>
                    <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                      {membersLoading ? "..." : membersError ? "—" : members.length}
                    </p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {selectedOrg.plan_tier !== "enterprise" && (
                  <div className="mt-6 pt-4 border-t border-ink/5">
                    <p className="text-sm text-ink-light mb-3">
                      Need more agents or team seats? Upgrade your plan.
                    </p>
                    <a
                      href="/#pricing"
                      className="inline-flex items-center gap-1.5 bg-teal-deep text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
                    >
                      View plans
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  </div>
                )}
              </section>

              {/* Members List */}
              <section className="bg-white rounded-2xl border border-ink/5 p-6">
                <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-4">
                  Members
                </h2>

                {membersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-cream animate-pulse" />
                    ))}
                  </div>
                ) : membersError ? (
                  <div className="bg-cream rounded-xl p-4 text-center">
                    <p className="text-sm text-ink-light">{membersError}</p>
                    <p className="text-xs text-ink-faint mt-1">
                      This feature will be available in a future update.
                    </p>
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-ink-light">No members found.</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-cream"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">{m.email}</p>
                          <p className="text-[11px] text-ink-faint">
                            Joined {new Date(m.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        {roleBadge(m.role)}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Invite Member */}
              <section className="bg-white rounded-2xl border border-ink/5 p-6">
                <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-2">
                  Invite a team member
                </h2>
                <p className="text-sm text-ink-light mb-4">
                  Send an invite to add someone to your organization.
                </p>

                <form onSubmit={handleInvite} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-teal-deep text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {inviteLoading ? "Sending..." : "Invite"}
                  </button>
                </form>

                {inviteError && (
                  <p className="text-coral-deep text-sm mt-3">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="text-teal-deep text-sm mt-3">Invite sent successfully.</p>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
