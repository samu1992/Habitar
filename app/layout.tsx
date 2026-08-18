import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const display = localFont({
  src: [
    { path: './fonts/stack-sans-headline-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/stack-sans-headline-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/stack-sans-headline-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const body = localFont({
  src: [
    { path: './fonts/stack-sans-text-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/stack-sans-text-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/stack-sans-text-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Habitar — Obra',
  description: 'Panel interno de proyectos',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Habitar' },
};

export const viewport: Viewport = {
  themeColor: '#171313',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // evita el zoom accidental con las manos sucias
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-obra-bg font-sans text-ink antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
