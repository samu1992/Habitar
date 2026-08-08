import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'un.studio — Obra',
  description: 'Panel interno de proyectos',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'un.obra' },
};

export const viewport: Viewport = {
  themeColor: '#121110',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // evita el zoom accidental con las manos sucias
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-obra-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
