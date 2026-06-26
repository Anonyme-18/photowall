import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
