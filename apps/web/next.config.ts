import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Partial Prerendering via Cache Components (Next.js 16+).
 * Static shell + Suspense holes for dynamic parts.
 * See: https://nextjs.org/docs/app/getting-started/partial-prerendering
 */
const nextConfig: NextConfig = {
  cacheComponents: true,
  // Self-contained server bundle for the Docker image (pnpm workspace root is two levels up).
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // no search engine may list, cache or preview any page, image or file
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
