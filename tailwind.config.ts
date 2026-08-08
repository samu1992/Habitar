import type { Config } from 'tailwindcss';

/**
 * Paleta derivada de la identidad de un.studio (servicios.html), invertida
 * para uso nocturno / en obra. El fondo no es negro puro: es un carbón
 * cálido, para que el bronce y la arcilla no se vean fluorescentes.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obra: {
          bg: '#121110',        // fondo
          surface: '#1B1917',   // tarjetas
          raised: '#24211D',    // inputs, sheets
          line: '#322E29',      // bordes
        },
        ink: '#F3EEE2',         // texto principal (crema)
        muted: '#9A9287',       // texto secundario
        brass: { DEFAULT: '#C79A56', deep: '#9C7A4C' },
        sage: '#8FA382',
        clay: '#D0805A',
        alert: '#D4614B',
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
