/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // TODO: ajuste según el repo de GitHub Pages
  basePath: process.env.NEXT_BASE_PATH || '',
  assetPrefix: process.env.NEXT_BASE_PATH || '',
  images: {
    // Desactiva el Image Optimization API en modo export estático
    // Permitimos imágenes remotas desde Pinterest (i.pinimg.com)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ephaemhbunbeddeiqlsq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'content.abt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.serviciotecnicoinformaticavalencia.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'serviciotecnicoinformaticavalencia.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.apple.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
