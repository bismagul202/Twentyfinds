import type { NextConfig } from "next";

const laravelOrigin = new URL(process.env.LARAVEL_ORIGIN || "http://localhost:8000").origin;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/admin/:path*", destination: `${laravelOrigin}/admin/:path*` },
      { source: "/api/:path*", destination: `${laravelOrigin}/api/:path*` },
      { source: "/cms-dashboard.css", destination: `${laravelOrigin}/cms-dashboard.css` },
      { source: "/storage/:path*", destination: `${laravelOrigin}/storage/:path*` },
    ];
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
