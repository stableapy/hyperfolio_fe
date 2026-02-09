import Link from 'next/link';

interface SiteTopNavProps {
  current?: 'api-docs' | 'billing';
}

export function SiteTopNav({ current }: SiteTopNavProps) {
  const links = [
    { href: '/', label: 'home', key: 'home' },
    { href: '/api-docs', label: 'api-docs', key: 'api-docs' },
    { href: '/billing', label: 'billing', key: 'billing' },
  ] as const;

  return (
    <header className="bg-theme-bg border-theme-border/50 border-b">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-theme-accent font-mono text-xs font-semibold"
        >
          {'<'} home
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const isCurrent = current === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-theme-accent/10 border-theme-accent/40 text-theme-accent'
                    : 'bg-theme-bg border-theme-border/70 text-theme-text-secondary hover:border-theme-accent/30'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
