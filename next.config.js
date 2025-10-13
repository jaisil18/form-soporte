/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración del puerto por defecto
  env: {
    PORT: '6001',
  },
  // Configuración para mejorar la compatibilidad con Supabase
  serverExternalPackages: ['@supabase/supabase-js']
}

module.exports = nextConfig
