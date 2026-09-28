import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.15"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/store/:path*",
  //       destination: "/store/:path*", // Ensure store routes work
  //     },
  //   ];
  // },
};

export default nextConfig;
