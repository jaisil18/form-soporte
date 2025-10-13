import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Obtener variables de entorno con valores por defecto
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flmudobluiyzllvgrwhs.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbXVkb2JsdWl5emxsdmdyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjEzMzcsImV4cCI6MjA3NTkzNzMzN30.UnoJlCpU4xZgFFCTmvEYHhf9AmIZ2WwgaoemWVjpT4o';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name);
        // Solo log para cookies importantes, no para fragmentos
        if (name === 'sb-flmudobluiyzllvgrwhs-auth-token' && !name.includes('.')) {
          console.log(`🍪 Middleware: Leyendo cookie ${name}:`, cookie?.value ? 'presente' : 'ausente');
        }
        return cookie?.value;
      },
      set(name: string, value: string, options: any) {
        // Solo log para cookies importantes
        if (name.includes('auth-token') && !name.includes('.')) {
          console.log(`🍪 Middleware: Estableciendo cookie ${name}`);
        }
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        // Solo log para cookies importantes
        if (name.includes('auth-token') && !name.includes('.')) {
          console.log(`🍪 Middleware: Eliminando cookie ${name}`);
        }
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Verificar si la ruta es del panel de administración
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acceso a la página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }

    try {
      // Verificar la sesión del usuario usando cookies
      console.log('🔍 Middleware: Verificando autenticación para:', request.nextUrl.pathname);
      
      // Primero intentar obtener la sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('❌ Middleware: Error al obtener sesión:', sessionError.message);
      }
      
      if (session?.user) {
        console.log('✅ Middleware: Usuario autenticado (sesión):', session.user.email);
        return response;
      }
      
      // Si no hay sesión, intentar obtener el usuario directamente
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log('❌ Middleware: Error al obtener usuario:', userError.message);
      }
      
      if (!user) {
        console.log('❌ Middleware: No hay usuario autenticado, redirigiendo al login');
        // Redirigir al login si no hay usuario autenticado
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      console.log('✅ Middleware: Usuario autenticado (usuario):', user.email);
      
    } catch (error) {
      console.error('❌ Error en middleware de autenticación:', error);
      const redirectUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
