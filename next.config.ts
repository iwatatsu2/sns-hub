import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./data/generated/**"],
    "/pipeline": ["./data/generated/**"],
    "/posts/**": ["./data/generated/**"],
  },
};

export default nextConfig;
