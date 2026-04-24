import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "polymarket.com", pathname: "/**" },
      { protocol: "https", hostname: "www.polymarket.com", pathname: "/**" },
      { protocol: "https", hostname: "polymarket-upload.s3.us-east-2.amazonaws.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["recharts", "jotai"],
  },
};

export default nextConfig;
