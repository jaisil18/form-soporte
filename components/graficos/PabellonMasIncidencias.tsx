'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PabellonMasIncidenciasProps {
  estadisticas: EstadisticasReporte | null;
}

export default function PabellonMasIncidencias({ estadisticas }: PabellonMasIncidenciasProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.incidencias_por_pabellon) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pabellón con Más Incidencias</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const datos = Object.entries(estadisticas.incidencias_por_pabellon)
    .sort(([, a], [, b]) => b - a);

  const series = [{
    name: 'Incidencias',
    data: datos.map(([, cantidad]) => cantidad)
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
    colors: ['#F59E0B'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        },
        horizontal: isMobile
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
      categories: datos.map(([pabellon]) => {
        const maxLength = isMobile ? 8 : 12;
        return pabellon.length > maxLength ? pabellon.substring(0, maxLength) + '...' : pabellon;
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
        <h3 className="text-lg font-semibold text-gray-900">Pabellón con Más Incidencias</h3>
        <span className="text-sm text-gray-500">Por pabellón</span>
      </div>
      <Chart options={options} series={series} type="bar" height={isMobile ? 250 : isTablet ? 300 : 350} />
    </div>
  );
}
