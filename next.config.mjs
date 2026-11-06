/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['*.e2b.app'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
