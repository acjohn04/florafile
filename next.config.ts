import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Google OAuth avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // GitHub OAuth avatars
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Railway S3 bucket (plant images)
      {
        protocol: "https",
        hostname: "t3.storageapi.dev",
      },
    ],
  },
};

export default nextConfig;
