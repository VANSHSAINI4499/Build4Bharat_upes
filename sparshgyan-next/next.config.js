/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from the Flask gesture service during dev
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
