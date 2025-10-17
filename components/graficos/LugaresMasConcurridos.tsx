'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface LugaresMasConcurridosProps {
  estadisticas: EstadisticasReporte | null;
  periodo?: 'mes' | 'trimestre' | 'año';
}

export default function LugaresMasConcurridos({ estadisticas }: LugaresMasConcurridosProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.lugares_mas_concurridos) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lugares Más Concurridos</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Obtener top lugares (5 en móvil, 10 en desktop)
  const topLugares = Object.entries(estadisticas.lugares_mas_concurridos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, isMobile ? 5 : 10);

  const series = [{
    name: 'Incidencias',
    data: topLugares.map(([, cantidad]) => cantidad)
  }];

  const options = {
    chart: {
      type: 'bar' as const,
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
    colors: ['#8B5CF6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#6B7280']
      }
    },
    xaxis: {
      categories: topLugares.map(([lugar]) => {
        const maxLength = isMobile ? 10 : 15;
        return lugar.length > maxLength ? lugar.substring(0, maxLength) + '...' : lugar;
      }),
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: isMobile ? '10px' : '12px'
        },
        rotate: isMobile ? 0 : -45
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
        <h3 className="text-lg font-semibold text-gray-900">Lugares Más Concurridos</h3>
        <span className="text-sm text-gray-500">Top {isMobile ? 5 : 10}</span>
      </div>
      <Chart options={options} series={series} type="bar" height={isMobile ? 250 : isTablet ? 300 : 350} />
    </div>
  );
}
