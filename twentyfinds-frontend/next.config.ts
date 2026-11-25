import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const dashboard = new URL("/admin", apiUrl).href;

    return ["/admin", "/admin/login"].map((source) => ({
      source,
      destination: dashboard,
      permanent: false,
    }));
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
