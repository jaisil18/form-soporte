'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TiposActividadesMasConcurridasProps {
  estadisticas: EstadisticasReporte | null;
  periodo?: 'mes' | 'trimestre' | 'año';
}

export default function TiposActividadesMasConcurridas({ estadisticas }: TiposActividadesMasConcurridasProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.tipos_actividad) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Actividades Más Concurridas</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Mostrar todos los tipos de actividades
  const actividades = Object.entries(estadisticas.tipos_actividad)
    .sort(([, a], [, b]) => b - a);

  if (actividades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Actividades Más Concurridas</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay actividades registradas
        </div>
      </div>
    );
  }

  const series = actividades.map(([, cantidad]) => cantidad);
  const labels = actividades.map(([tipo]) => tipo);

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
        formatter: (value: number) => {
          const total = series.reduce((a, b) => a + b, 0);
          const porcentaje = ((value / total) * 100).toFixed(1);
          return `${value} actividades (${porcentaje}%)`;
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tipos de Actividades Más Concurridas</h3>
        <span className="text-sm text-gray-500">Todas las actividades</span>
      </div>
      <Chart options={options} series={series} type="pie" height={isMobile ? 300 : isTablet ? 320 : 350} />
    </div>
  );
}
