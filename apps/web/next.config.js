/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites act as a reverse proxy - requests made from the browser to
  // `/api/auth/*` are forwarded to the backend server
  async rewrites() {
    return [
      {
        // Proxy all auth-related requests to the NestJS backend.
        // :path* is a wildcard that matches any sub-path
        source: '/api/auth/:path*',
        destination: `${process.env.API_URL}/api/auth/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
