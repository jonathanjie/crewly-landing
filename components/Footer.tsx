export default function Footer() {
  return (
    <footer className="bg-cream border-t border-ink/5 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <div className="w-2 h-2 rounded-full bg-coral" />
              <div className="w-2 h-2 rounded-full bg-teal-deep" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
              crewly
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-ink-light">
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How it works
            </a>
            <a href="#use-cases" className="hover:text-ink transition-colors">
              Use cases
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="mailto:hello@crewly.chat" className="hover:text-ink transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} Crewly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
