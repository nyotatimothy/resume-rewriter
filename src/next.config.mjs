/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['placeholder.svg'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-vercel-domain/api/:path*',
      },
    ]
  },
}

export default nextConfig
