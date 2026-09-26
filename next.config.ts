import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Limite la RAM consommée par le cache Webpack (souvent la cause de ERR_MEMORY_ALLOCATION_FAILED)
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
    }
    return config;
  },
};

export default nextConfig;
