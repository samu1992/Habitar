/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' sirve para el Dockerfile del anexo.
  // Vercel lo ignora sin efectos secundarios.
  output: 'standalone',
  experimental: {
    // La app es de dos personas: no queremos cachear datos entre requests.
    staleTimes: { dynamic: 0 },
  },
};
export default nextConfig;
