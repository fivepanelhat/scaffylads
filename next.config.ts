import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent C:\Users\Admin\package-lock.json confuses Turbopack workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
