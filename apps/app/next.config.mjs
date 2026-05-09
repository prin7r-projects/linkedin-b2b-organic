/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["postgres", "ioredis"]
  }
};

export default nextConfig;
