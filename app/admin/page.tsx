'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Clock, 
  Download, 
  LogOut, 
  Home,
  Activity,
  TrendingUp,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { getEstadisticasReporte } from '@/lib/supabase';
import type { EstadisticasReporte } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener usuario actual
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error al obtener usuario:', userError);
          router.push('/admin/login');
          return;
        }

        if (!user) {
          console.log('No hay usuario autenticado, redirigiendo al login');
          router.push('/admin/login');
          return;
        }

        console.log('✅ Usuario autenticado:', user.email);
        setUsuario(user);

        // Cargar estadísticas
        try {
          const stats = await getEstadisticasReporte();
          setEstadisticas(stats);
        } catch (statsError) {
          console.error('Error al cargar estadísticas:', statsError);
          // No redirigir por error de estadísticas, solo mostrar datos vacíos
        }
      } catch (error) {
        console.error('Error general al cargar datos:', error);
        router.push('/admin/login');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const navegarA = (ruta: string) => {
    router.push(ruta);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const cardsEstadisticas = [
    {
      titulo: 'Total de Incidencias',
      valor: estadisticas?.total_incidencias || 0,
      icono: FileText,
      color: 'bg-blue-500',
      descripcion: 'Registros totales'
    },
    {
      titulo: 'Incidencias Hoy',
      valor: estadisticas?.tendencia_temporal[estadisticas?.tendencia_temporal.length - 1]?.cantidad || 0,
      icono: Activity,
      color: 'bg-green-500',
      descripcion: 'Registros de hoy'
    },
    {
      titulo: 'Promedio Diario',
      valor: estadisticas ? Math.round(estadisticas.total_incidencias / 30) : 0,
      icono: TrendingUp,
      color: 'bg-purple-500',
      descripcion: 'Últimos 30 días'
    }
  ];

  const menuItems = [
    {
      titulo: 'Reportes y Estadísticas',
      descripcion: 'Ver gráficos, tablas y análisis de incidencias',
      icono: BarChart3,
      ruta: '/admin/reportes',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      titulo: 'Configuración del Formulario',
      descripcion: 'Gestionar sedes, pabellones, tipos y equipos',
      icono: Settings,
      ruta: '/admin/configuracion',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      titulo: 'Gestión de Usuarios',
      descripcion: 'Administrar usuarios de soporte',
      icono: Users,
      ruta: '/admin/usuarios',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      titulo: 'Gestión de Horarios',
      descripcion: 'Configurar horarios de disponibilidad',
      icono: Clock,
      ruta: '/admin/horarios',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      titulo: 'Exportación de Datos',
      descripcion: 'Exportar reportes a Excel y otros formatos',
      icono: Download,
      ruta: '/admin/exportacion',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Volver al Formulario</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Sistema de Incidencias UCT</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {usuario?.email || 'Administrador'}
                </p>
                <p className="text-xs text-gray-500">Conectado</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cardsEstadisticas.map((card, index) => {
            const IconComponent = card.icono;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.titulo}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.valor}</p>
                    <p className="text-xs text-gray-500">{card.descripcion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Menú principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const IconComponent = item.icono;
            return (
              <button
                key={index}
                onClick={() => navegarA(item.ruta)}
                className={`${item.color} text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 p-6 text-left`}
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.titulo}</h3>
                <p className="text-sm opacity-90">{item.descripcion}</p>
              </button>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Estado del Sistema</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema operativo</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Última Actualización</h4>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleString('es-PE', {
                  timeZone: 'America/Lima',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
