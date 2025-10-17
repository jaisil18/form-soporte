import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para permitir cross origin requests desde la IP específica
  experimental: {
    allowedDevOrigins: ['172.16.31.17:6001']
  }
};

export default nextConfig;
