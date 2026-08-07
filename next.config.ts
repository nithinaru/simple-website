import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: import.meta.dirname,
  },
  reactStrictMode: true,
  // hide the floating next.js dev badge in the corner
  devIndicators: false,
};

export default nextConfig;
