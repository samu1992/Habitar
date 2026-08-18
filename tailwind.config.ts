import type { Config } from 'tailwindcss';

/**
 * Paleta oficial de marca (un.studio, sección 5 del brand kit), invertida
 * para uso nocturno / en obra. El fondo y las superficies son interpolaciones
 * de Negro + Gris oscuro — monocromo puro, sin tinte agregado. Los colores
 * de acento (bordó, mandarina, verde, celeste, mostaza, amarillo, durazno)
 * quedan disponibles para estados puntuales (avance, cifras, alertas).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obra: {
          bg: '#171313',        // fondo — Negro
          surface: '#1C1818',   // tarjetas
          raised: '#201C1B',    // inputs, sheets
          line: '#2E2A28',      // bordes
        },
        ink: '#F5F1E2',         // texto principal — Crema
        muted: '#8C8880',       // texto secundario — Gris medio
        grafito: '#4A4542',     // Gris oscuro (texto sobre crema, superficies claras)
        marfil: '#D9D4C7',      // Gris claro (fondos sutiles sobre crema)
        bordo: '#452122',
        mandarina: '#EB754F',
        verde: '#093C2D',
        celeste: '#79A4EC',
        mostaza: '#CDBC04',
        amarillo: '#F2BC5A',
        durazno: '#FCDDAE',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      keyframes: {
        rise: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        rise: 'rise .22s cubic-bezier(.2,.8,.2,1)',
        fade: 'fade .15s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
