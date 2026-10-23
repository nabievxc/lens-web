import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages serves this from /lens-web, not the domain root.
  basePath: process.env.GITHUB_PAGES === "1" ? "/lens-web" : "",
};

export default nextConfig;
