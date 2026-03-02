"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) router.replace("/portal");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { error: authErr } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authErr) setError(authErr.message);
    else router.push("/portal");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <div className="w-2 h-2 rounded-full bg-coral" />
              <div className="w-2 h-2 rounded-full bg-teal-deep" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              crewly
            </span>
          </div>
          <p className="text-ink-light text-sm">
            {isSignUp ? "Create your account" : "Sign in to your portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
          />

          {error && (
            <p className="text-coral-deep text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-deep text-white font-semibold py-3 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-light mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-teal-deep font-medium hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <div className="text-center mt-8">
          <a href="/" className="text-xs text-ink-faint hover:text-ink-light transition-colors">
            &larr; Back to crewly.chat
          </a>
        </div>
      </div>
    </div>
  );
}
