import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Lets a second dev instance run without clobbering the main .next dir.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Allow phones on the home network to load dev assets.
  allowedDevOrigins: ["192.168.1.29"],
};

export default nextConfig;
