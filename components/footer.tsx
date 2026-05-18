import Link from "next/link"

const socials = [
  {
    label: "Instagram",
    href: "#", // TODO: Add real link
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#", // TODO: Add real link
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.47C18.88 4 12 4 12 4s-6.88 0-8.6.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.53C5.12 20 12 20 12 20s6.88 0 8.6-.47a2.78 2.78 0 0 0 1.94-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#", // TODO: Add real link
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

const legalLinks = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
]

export function Footer() {
  return (
    <footer
      style={{ borderTop: "1px solid var(--glass-border)" }}
      aria-label="Rodapé"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <a
            href="#inicio"
            className="font-black text-white tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm"
            style={{ fontSize: "1.1rem", letterSpacing: "-0.03em" }}
          >
            unoduno
          </a>

          {/* Social links — 44px touch targets */}
          <nav className="flex items-center gap-2" aria-label="Links sociais">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                {...(social.href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center justify-center w-11 h-11 rounded-lg transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{ color: "var(--text-subtle)" }}
              >
                {social.icon}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <p className="text-xs font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
            &copy; 2026 Unoduno — Todos os direitos reservados
          </p>

          {/* Legal links + contact */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href as "/termos" | "/privacidade"}
                className="text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm leading-4"
                style={{ color: "var(--text-subtle)" }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:oi@unoduno.com"
              className="text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm leading-4"
              style={{ color: "var(--text-subtle)" }}
            >
              oi@unoduno.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
