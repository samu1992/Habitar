'use client';

export type TabKey = 'resumen' | 'finanzas' | 'logistica';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'resumen', label: 'Resumen',
    icon: <path d="M4 5h16M4 12h16M4 19h10" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    key: 'finanzas', label: 'Finanzas',
    icon: <path d="M4 18V9M10 18V5M16 18v-6M22 18H2" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    key: 'logistica', label: 'Logística',
    icon: <path d="M4 7h16M4 12h16M4 17h16M8 7v10" strokeWidth="1.8" strokeLinecap="round" />,
  },
];

/** Barra fija: los tres destinos siempre a la altura del pulgar, 64 px de alto. */
export default function BottomTabBar({
  active, onChange, badge,
}: { active: TabKey; onChange: (t: TabKey) => void; badge?: Partial<Record<TabKey, number>> }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-obra-line bg-obra-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map((t) => {
          const on = t.key === active;
          const count = badge?.[t.key];
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-current={on ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 py-3.5 ${on ? 'text-ink' : 'text-muted'}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                {t.icon}
              </svg>
              <span className="text-[11px] font-medium">{t.label}</span>
              {!!count && (
                <span className="tabular absolute right-[22%] top-2 min-w-[18px] rounded-full bg-mandarina px-1 text-[10px] font-semibold leading-[18px] text-obra-bg">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
