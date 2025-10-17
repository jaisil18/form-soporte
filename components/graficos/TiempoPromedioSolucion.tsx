'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TiempoPromedioSolucionProps {
  estadisticas: EstadisticasReporte | null;
  periodo?: 'mes' | 'trimestre' | 'año';
}

export default function TiempoPromedioSolucion({ estadisticas }: TiempoPromedioSolucionProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.tiempo_promedio) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiempo Promedio de Solución</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const datos = Object.entries(estadisticas.tiempo_promedio).map(([actividad, tiempo]) => ({
    x: actividad,
    y: tiempo
  }));

  const series = [{
    name: 'Tiempo (min)',
    data: datos
  }];

  const options = {
    chart: {
      type: 'donut' as const,
      height: isMobile ? 300 : isTablet ? 320 : 350,
      animations: {
        enabled: true,
        easing: 'easeinout' as const,
        speed: 800
      }
    },
    colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'],
    labels: Object.keys(estadisticas.tiempo_promedio),
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Tiempo Promedio',
              formatter: () => {
                const total = Object.values(estadisticas.tiempo_promedio).reduce((a, b) => a + b, 0);
                const promedio = total / Object.keys(estadisticas.tiempo_promedio).length;
                return `${promedio.toFixed(1)} min`;
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: { w: { config: { labels: string[] } }; seriesIndex: number }) => {
        const label = opts.w.config.labels[opts.seriesIndex];
        return `${label}: ${val.toFixed(1)} min`;
      }
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
        formatter: (value: number) => `${value} minutos promedio`
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tiempo Promedio de Solución</h3>
        <span className="text-sm text-gray-500">Por actividad</span>
      </div>
      <Chart options={options} series={series} type="donut" height={isMobile ? 300 : isTablet ? 320 : 350} />
    </div>
  );
}
