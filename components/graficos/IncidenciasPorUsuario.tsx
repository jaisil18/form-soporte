'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EstadisticasReporte } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface IncidenciasPorUsuarioProps {
  estadisticas: EstadisticasReporte | null;
  periodo?: 'mes' | 'trimestre' | 'año';
}

export default function IncidenciasPorUsuario({ estadisticas }: IncidenciasPorUsuarioProps) {
  const { isMobile, isTablet } = useResponsive();
  
  if (!estadisticas?.incidencias_por_usuario) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidencias por Persona</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Obtener top usuarios (5 en móvil, 10 en desktop)
  const topUsuarios = Object.entries(estadisticas.incidencias_por_usuario)
    .sort(([, a], [, b]) => b - a)
    .slice(0, isMobile ? 5 : 10);

  const series = [{
    name: 'Incidencias',
    data: topUsuarios.map(([, cantidad]) => cantidad)
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
    colors: ['#10B981'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
      offsetX: 0,
      style: {
        fontSize: '12px',
        colors: ['#6B7280']
      }
    },
    xaxis: {
      categories: topUsuarios.map(([usuario]) => {
        const maxLength = isMobile ? 15 : 20;
        return usuario.length > maxLength ? usuario.substring(0, maxLength) + '...' : usuario;
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
        <h3 className="text-lg font-semibold text-gray-900">Incidencias por Persona</h3>
        <span className="text-sm text-gray-500">Top {isMobile ? 5 : 10}</span>
      </div>
      <Chart options={options} series={series} type="bar" height={isMobile ? 250 : isTablet ? 300 : 350} />
    </div>
  );
}
