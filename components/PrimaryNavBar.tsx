'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  {
    href: '/', label: 'Proyectos',
    icon: <path d="M4 7h16M4 12h16M4 17h16M8 7v10" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    href: '/perfil', label: 'Perfil',
    icon: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

/** Nav de nivel superior: navega entre rutas reales (a diferencia de BottomTabBar, que solo cambia de tab dentro de un proyecto). */
export default function PrimaryNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-obra-line bg-obra-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {ITEMS.map((item) => {
          const on = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-3.5 ${on ? 'text-ink' : 'text-muted'}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                {item.icon}
              </svg>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
