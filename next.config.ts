import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['cdn.sanity.io'], // Add your allowed image domains here
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
