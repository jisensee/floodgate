/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // workaround for weird issue where influence sdk leads to js errors in production build
  swcMinify: false,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.influenceth.io',
      },
      {
        protocol: 'https',
        hostname: 'images-prerelease.influenceth.io',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST,
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    config.externals.push({
      'node:crypto': 'commonjs crypto',
    })
    return config
  },
}

export default nextConfig
