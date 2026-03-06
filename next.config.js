/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: '/past',
        destination: '/archive',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
