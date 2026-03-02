// app/portal/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (!supabase) {
      setPwError("Auth service unavailable.");
      return;
    }

    setPwLoading(true);

    // Verify current password by re-authenticating
    const email = session?.user?.email;
    if (!email) {
      setPwError("No email found in session.");
      setPwLoading(false);
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInErr) {
      setPwError("Current password is incorrect.");
      setPwLoading(false);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setPwError(updateErr.message);
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
        Settings
      </h1>

      <div className="space-y-6 max-w-lg">
        {/* Account Info */}
        <section className="bg-white rounded-2xl border border-ink/5 p-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-4">
            Account
          </h2>
          <div>
            <label className="block text-xs text-ink-light mb-1">Email</label>
            <div className="px-4 py-3 rounded-xl border border-ink/5 bg-cream text-sm text-ink-light">
              {session?.user?.email ?? "—"}
            </div>
            <p className="text-[11px] text-ink-faint mt-1.5">
              Email cannot be changed from this page.
            </p>
          </div>
        </section>

        {/* Password Change */}
        <section className="bg-white rounded-2xl border border-ink/5 p-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-4">
            Change password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="current-pw" className="block text-xs text-ink-light mb-1">
                Current password
              </label>
              <input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
              />
            </div>
            <div>
              <label htmlFor="new-pw" className="block text-xs text-ink-light mb-1">
                New password
              </label>
              <input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-pw" className="block text-xs text-ink-light mb-1">
                Confirm new password
              </label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
              />
            </div>

            {pwError && (
              <p className="text-coral-deep text-sm">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-teal-deep text-sm">Password updated successfully.</p>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50"
            >
              {pwLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        {/* Sign Out */}
        <section className="bg-white rounded-2xl border border-ink/5 p-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-2">
            Session
          </h2>
          <p className="text-sm text-ink-light mb-4">
            Sign out of your Crewly account on this device.
          </p>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold text-coral-deep hover:text-coral-deep/80 transition-colors px-4 py-2 rounded-xl border border-coral/20 hover:bg-coral/5"
          >
            Sign out
          </button>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-2xl border border-coral/10 p-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-coral-deep mb-2">
            Delete account
          </h2>
          <p className="text-sm text-ink-light mb-4">
            Account deletion is handled by our support team to ensure all data is
            properly removed and any active subscriptions are cancelled.
          </p>
          <a
            href="mailto:support@crewly.chat?subject=Account%20Deletion%20Request"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-light hover:text-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact support
          </a>
        </section>
      </div>
    </div>
  );
}
