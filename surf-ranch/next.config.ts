import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Relative asset paths so the exported site also works opened directly
  // from the filesystem (file://), not just when served from a web root.
  assetPrefix: "./",
  images: { unoptimized: true },
};

export default nextConfig;
