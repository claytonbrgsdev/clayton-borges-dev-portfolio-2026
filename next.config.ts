import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add external image hosts here if needed (e.g. Supabase, S3)
    ],
  },
  turbopack: {
    // Silence the workspace-root warning caused by a pnpm-lock.yaml in ~/
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
