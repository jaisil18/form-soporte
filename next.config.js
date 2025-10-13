/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración del puerto por defecto
  env: {
    PORT: '6001',
  },
  // Configuración para mejorar la compatibilidad con Supabase
  serverExternalPackages: ['@supabase/supabase-js'],
  // Configuración para Vercel
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Variables de entorno públicas
  publicRuntimeConfig: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

module.exports = nextConfig
