'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Settings, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [loginExitoso, setLoginExitoso] = useState(false);

  const redirectTo = searchParams.get('redirectTo') || '/admin';

  // Eliminamos la verificación automática de sesión
  // Ahora siempre se mostrará el formulario de login
  // La verificación se hará solo al intentar hacer login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      console.log('🔐 Intentando login con:', email);
      
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log('❌ Error de autenticación:', authError.message);
        setError('Credenciales incorrectas. Por favor verifique su email y contraseña.');
        return;
      }

      if (data.user) {
        console.log('✅ Login exitoso para:', data.user.email);
        console.log('🔄 Redirigiendo a:', redirectTo);
        
        setLoginExitoso(true);
        
        // Esperar un poco más para que las cookies se establezcan
        setTimeout(async () => {
          console.log('🚀 Ejecutando redirección...');
          
          // Verificar que la sesión esté establecida
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          console.log('🔍 Sesión después del login:', session ? 'establecida' : 'no establecida');
          
          // Intentar redirección con router primero
          try {
            router.push(redirectTo);
          } catch (error) {
            console.log('❌ Error con router.push, usando window.location');
            window.location.href = redirectTo;
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          
          <p className="text-gray-600">
            Ingrese sus credenciales para acceder al panel de administración
          </p>
        </div>

        {loginExitoso ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">¡Login Exitoso!</h3>
              <p className="text-green-700 mb-4">Redirigiendo al panel de administración...</p>
              <button
                onClick={() => window.location.href = redirectTo}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@soporte.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !email || !password}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              cargando || !email || !password
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {cargando ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                <span>Iniciar Sesión</span>
              </div>
            )}
          </button>
        </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← Volver al formulario principal
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Información del Sistema:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Gestión de incidencias y reportes</li>
            <li>• Configuración de formularios</li>
            <li>• Control de horarios</li>
            <li>• Exportación de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
