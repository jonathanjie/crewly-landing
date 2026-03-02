// app/portal/loading.tsx — portal-wide loading skeleton

export default function PortalLoading() {
  return (
    <div>
      {/* Branded loading indicator — three dots pulsing */}
      <div className="flex items-center justify-center py-8 mb-6">
        <div className="flex gap-2">
          <div
            className="w-3 h-3 rounded-full bg-teal animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-coral animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-teal-deep animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      {/* Shimmer cards matching dashboard layout */}
      <div className="space-y-6">
        {/* Stat cards row */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-ink/5">
              <div className="h-3 w-20 bg-ink/5 rounded-full mb-3 animate-pulse" />
              <div className="h-8 w-16 bg-ink/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-2xl border border-ink/5 p-6">
          <div className="h-4 w-32 bg-ink/5 rounded-full mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-ink/5 animate-pulse" />
                <div className="h-3.5 bg-ink/5 rounded-full animate-pulse" style={{ width: `${50 + i * 8}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
