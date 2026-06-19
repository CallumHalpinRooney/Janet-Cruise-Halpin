import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the entire site is client-rendered with no server logic,
  // so we ship plain HTML/CSS/JS into `out/`. Most reliable Netlify target —
  // no serverless runtime to misfire, just static assets.
  output: "export",
  // We use plain <img> tags; disable the optimizer so export doesn't need a server.
  images: { unoptimized: true },
};

export default nextConfig;
