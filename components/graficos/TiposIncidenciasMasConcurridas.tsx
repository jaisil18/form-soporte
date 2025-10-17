'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TiposIncidenciasMasConcurridasProps {
  estadisticas: EstadisticasReporte | null;
}

export default function TiposIncidenciasMasConcurridas({ estadisticas }: TiposIncidenciasMasConcurridasProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.tipos_actividad) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Incidencias Más Concurridas</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Filtrar solo incidencias (no actividades como "Solicitud")
  const incidencias = Object.entries(estadisticas.tipos_actividad)
    .filter(([tipo]) => tipo.toLowerCase().includes('incidencia'))
    .sort(([, a], [, b]) => b - a);

  if (incidencias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Incidencias Más Concurridas</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay incidencias registradas
        </div>
      </div>
    );
  }

  const series = incidencias.map(([, cantidad]) => cantidad);
  const labels = incidencias.map(([tipo]) => tipo);

  const options = {
    chart: {
      type: 'pie' as const,
      height: isMobile ? 300 : isTablet ? 320 : 350,
      animations: {
        enabled: true,
        easing: 'easeinout' as const,
        speed: 800
      }
    },
    colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'],
    labels: labels,
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '0%'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      labels: {
        colors: '#6B7280',
        fontSize: isMobile ? '10px' : '12px'
      }
    },
    tooltip: {
      theme: 'light' as const,
      y: {
        formatter: (value: number, { seriesIndex }: any) => {
          const total = series.reduce((a, b) => a + b, 0);
          const porcentaje = ((value / total) * 100).toFixed(1);
          return `${value} incidencias (${porcentaje}%)`;
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tipos de Incidencias Más Concurridas</h3>
        <span className="text-sm text-gray-500">Solo incidencias</span>
      </div>
      <Chart options={options} series={series} type="pie" height={isMobile ? 300 : isTablet ? 320 : 350} />
    </div>
  );
}
