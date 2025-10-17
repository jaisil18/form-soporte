'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { getEstadisticasReporte, getEstadisticasConFiltroTemporal } from '@/lib/supabase';
import type { EstadisticasReporte } from '@/types';
import ReporteTemporal from '@/components/graficos/ReporteTemporal';
import IncidenciasPorUsuario from '@/components/graficos/IncidenciasPorUsuario';
import LugaresMasConcurridos from '@/components/graficos/LugaresMasConcurridos';
import TiempoPromedioSolucion from '@/components/graficos/TiempoPromedioSolucion';
import PabellonMasIncidencias from '@/components/graficos/PabellonMasIncidencias';
import TiposIncidenciasMasConcurridas from '@/components/graficos/TiposIncidenciasMasConcurridas';
import ChartSkeleton from '@/components/ui/ChartSkeleton';
import { useResponsive } from '@/hooks/useResponsive';

export default function AdminDashboard() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mes' | 'trimestre' | 'año'>('mes');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const stats = await getEstadisticasConFiltroTemporal(periodoSeleccionado);
        setEstadisticas(stats);
      } catch (statsError) {
        console.error('Error al cargar estadísticas:', statsError);
        // Mostrar datos vacíos en caso de error
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [periodoSeleccionado]);


  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
    }
  ];


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título de la página */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Panel principal con análisis de incidencias</p>
      </div>
        {/* Estadísticas rápidas */}
        <div className={`
          grid gap-6 mb-8
          ${isMobile ? 'grid-cols-1' : ''}
          ${isTablet ? 'grid-cols-1' : ''}
          ${isDesktop ? 'grid-cols-2' : ''}
        `}>
          {cardsEstadisticas.map((card, index) => {
            const IconComponent = card.icono;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className={`flex items-center ${isMobile ? 'flex-col text-center' : ''}`}>
                  <div className={`p-3 rounded-lg ${card.color} ${isMobile ? 'mb-3' : ''}`}>
                    <IconComponent className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} text-white`} />
                  </div>
                  <div className={`${isMobile ? '' : 'ml-4'}`}>
                    <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-600`}>{card.titulo}</p>
                    <p className={`${isMobile ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900`}>{card.valor}</p>
                    <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>{card.descripcion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selector de período temporal */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Período de Análisis</h3>
            <div className="flex gap-2">
              {[
                { key: 'mes', label: 'Mes Actual' },
                { key: 'trimestre', label: 'Trimestre Actual' },
                { key: 'año', label: 'Año Actual' }
              ].map((periodo) => (
                <button
                  key={periodo.key}
                  onClick={() => setPeriodoSeleccionado(periodo.key as 'mes' | 'trimestre' | 'año')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    periodoSeleccionado === periodo.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {periodo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gráficos de estadísticas */}
        <div id="graficos" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Análisis de Incidencias</h2>
          <div className={`
            grid gap-6
            ${isMobile ? 'grid-cols-1' : ''}
            ${isTablet ? 'grid-cols-1' : ''}
            ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : ''}
          `}>
            {cargando ? (
              <>
                <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Reporte Temporal" />
                <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Incidencias por Persona" />
                <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Lugares Más Concurridos" />
                <ChartSkeleton height={isMobile ? 300 : isTablet ? 320 : 350} title="Tiempo Promedio de Solución" />
                <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Pabellón con Más Incidencias" />
                <ChartSkeleton height={isMobile ? 300 : isTablet ? 320 : 350} title="Tipos de Incidencias Más Concurridas" />
              </>
            ) : (
              <>
                <ReporteTemporal estadisticas={estadisticas} periodo={periodoSeleccionado} />
                <IncidenciasPorUsuario estadisticas={estadisticas} />
                <LugaresMasConcurridos estadisticas={estadisticas} />
                <TiempoPromedioSolucion estadisticas={estadisticas} />
                <PabellonMasIncidencias estadisticas={estadisticas} />
                <TiposIncidenciasMasConcurridas estadisticas={estadisticas} />
              </>
            )}
          </div>
        </div>

    </div>
  );
}

