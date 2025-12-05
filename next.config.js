/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.74.1:3000']
    },
  },
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig

