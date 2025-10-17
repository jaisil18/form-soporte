'use client';

import dynamic from 'next/dynamic';
import { EstadisticasReporte } from '@/types';

// Importar ApexCharts dinámicamente para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TiposIncidenciasProps {
  estadisticas: EstadisticasReporte | null;
  periodo?: 'mes' | 'trimestre' | 'año';
}

export default function TiposIncidencias({ estadisticas }: TiposIncidenciasProps) {
  if (!estadisticas?.tipos_incidencia) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay datos de tipos de incidencias disponibles</p>
        </div>
      </div>
    );
  }

  const tiposData = estadisticas.tipos_incidencia;
  
  // Ordenar por cantidad y tomar los primeros 8
  const tiposOrdenados = Object.entries(tiposData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (tiposOrdenados.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay tipos de incidencias registradas</p>
        </div>
      </div>
    );
  }

  const series = tiposOrdenados.map(([, cantidad]) => cantidad);
  const labels = tiposOrdenados.map(([tipo, cantidad]) => {
    // Truncar nombres largos
    const nombreTruncado = tipo.length > 15 ? tipo.substring(0, 15) + '...' : tipo;
    return `${nombreTruncado} (${cantidad})`;
  });

  // Colores para las barras
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const options = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
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
        colors: ['#000']
      }
    },
    colors: colors,
    xaxis: {
      categories: labels,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    title: {
      text: 'Tipos de Incidencias Más Frecuentes',
      align: 'left' as const,
      style: {
        fontSize: '16px',
        fontWeight: '600'
      }
    },
    subtitle: {
      text: `Top ${tiposOrdenados.length} tipos de incidencias`,
      align: 'left' as const,
      style: {
        fontSize: '12px',
        color: '#6B7280'
      }
    },
    tooltip: {
      theme: 'light' as const,
      y: {
        formatter: (value: number) => `${value} incidencias`
      }
    },
    legend: {
      show: false
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        dataLabels: {
          style: {
            fontSize: '10px'
          }
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '10px'
            }
          }
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tipos de Incidencias
        </h3>
        <p className="text-sm text-gray-600">
          Distribución de tipos de incidencias técnicas reportadas
        </p>
      </div>
      
      <div className="h-80">
        <Chart
          options={options}
          series={[{ name: 'Incidencias', data: series }]}
          type="bar"
          height="100%"
        />
      </div>
      
      {/* Resumen estadístico */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total tipos:</span>
            <span className="ml-2 font-semibold">{tiposOrdenados.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Más frecuente:</span>
            <span className="ml-2 font-semibold">
              {tiposOrdenados[0]?.[0]?.substring(0, 20)}
              {tiposOrdenados[0]?.[0]?.length > 20 ? '...' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
