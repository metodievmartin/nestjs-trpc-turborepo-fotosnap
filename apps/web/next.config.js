/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites act as a reverse proxy - requests made from the browser to
  // `/api/*` are forwarded to the backend server
  async rewrites() {
    return [
      {
        // Proxy all auth-related requests to the NestJS backend.
        // :path* is a wildcard that matches any sub-path
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'development',

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: process.env.BACKEND_PROTOCOL,
        hostname: process.env.BACKEND_HOST,
      },
    ],
  },
};

export default nextConfig;
