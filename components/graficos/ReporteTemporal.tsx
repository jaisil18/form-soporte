'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ReporteTemporalProps {
  estadisticas: EstadisticasReporte | null;
  periodo: 'mes' | 'trimestre' | 'año';
}

export default function ReporteTemporal({ estadisticas, periodo }: ReporteTemporalProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.tendencia_temporal) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte Temporal</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const series = [{
    name: 'Incidencias',
    data: estadisticas.tendencia_temporal.map(item => item.cantidad)
  }];

  const options = {
    chart: {
      type: 'area' as const,
      height: isMobile ? 250 : isTablet ? 300 : 350,
      toolbar: {
        show: !isMobile
      },
      animations: {
        enabled: true,
        easing: 'easeinout' as const,
        speed: 800
      }
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: estadisticas.tendencia_temporal.map(item => {
        const fecha = new Date(item.fecha);
        return isMobile 
          ? fecha.toLocaleDateString('es-PE', { day: 'numeric' })
          : fecha.toLocaleDateString('es-PE', { 
              month: 'short', 
              day: 'numeric' 
            });
      }),
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: isMobile ? '10px' : '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    tooltip: {
      theme: 'light' as const,
      y: {
        formatter: (value: number) => `${value} incidencias`
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reporte Temporal</h3>
        <span className="text-sm text-gray-500 capitalize">{periodo} actual</span>
      </div>
      <Chart options={options} series={series} type="area" height={isMobile ? 250 : isTablet ? 300 : 350} />
    </div>
  );
}
