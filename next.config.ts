import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: import.meta.dirname,
  },
  reactStrictMode: true,
  // hide the floating next.js dev badge in the corner
  devIndicators: false,
  // the projects page isn't ready to be seen: send anyone who finds it home.
  // temporary, so search engines don't treat it as gone for good. delete
  // this, and put it back in sitemap.xml, when it is
  async redirects() {
    return [{ source: "/projects", destination: "/", permanent: false }];
  },
};

export default nextConfig;
