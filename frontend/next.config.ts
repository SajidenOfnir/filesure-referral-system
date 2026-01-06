/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are accessible
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig