'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  BarChart3,
  PieChart,
  Users,
  Clock,
  Search
} from 'lucide-react';
import { getIncidencias, getEstadisticasReporte } from '@/lib/supabase';
import { exportarIncidenciasExcel, exportarEstadisticasExcel } from '@/lib/exportarExcel';
import type { Incidencia, EstadisticasReporte, FiltrosReporte } from '@/types';
import { formatearFechaHora, obtenerColorPorTipoActividad, obtenerColorPorSede } from '@/lib/utils';

export default function ReportesPage() {
  const router = useRouter();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [filtros, setFiltros] = useState<FiltrosReporte>({});
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [filtros, cargarDatos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [incidenciasData, estadisticasData] = await Promise.all([
        getIncidencias(filtros),
        getEstadisticasReporte(filtros)
      ]);
      
      setIncidencias(incidenciasData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleExportarIncidencias = () => {
    exportarIncidenciasExcel(incidencias);
  };

  const handleExportarEstadisticas = () => {
    if (estadisticas) {
      exportarEstadisticasExcel(estadisticas as unknown as Record<string, unknown>);
    }
  };

  const handleFiltrar = (nuevosFiltros: Partial<FiltrosReporte>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const incidenciasFiltradas = incidencias.filter(incidencia =>
    !busqueda || 
    incidencia.sede.toLowerCase().includes(busqueda.toLowerCase()) ||
    incidencia.pabellon.toLowerCase().includes(busqueda.toLowerCase()) ||
    incidencia.tipo_actividad.toLowerCase().includes(busqueda.toLowerCase()) ||
    (incidencia.equipo_afectado && incidencia.equipo_afectado.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver al Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-sm text-gray-600">Análisis de incidencias registradas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  mostrarFiltros 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filtros</span>
              </button>
              
              <button
                onClick={handleExportarEstadisticas}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Exportar Estadísticas</span>
              </button>
              
              <button
                onClick={handleExportarIncidencias}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Exportar Datos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filtros.fecha_desde || ''}
                  onChange={(e) => handleFiltrar({ fecha_desde: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fecha_hasta || ''}
                  onChange={(e) => handleFiltrar({ fecha_hasta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sede
                </label>
                <select
                  value={filtros.sede || ''}
                  onChange={(e) => handleFiltrar({ sede: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las sedes</option>
                  <option value="Moche">Moche</option>
                  <option value="Mansiche">Mansiche</option>
                  <option value="Colón">Colón</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Actividad
                </label>
                <select
                  value={filtros.tipo_actividad || ''}
                  onChange={(e) => handleFiltrar({ tipo_actividad: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Incidencia">Incidencia</option>
                  <option value="Mudanza">Mudanza</option>
                  <option value="Visita técnica/campo">Visita técnica/campo</option>
                  <option value="Soporte evento">Soporte evento</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFiltros({})}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas resumidas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Incidencias</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total_incidencias}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sedes Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(estadisticas.incidencias_por_sede).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tipos de Actividad</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(estadisticas.tipos_actividad).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(estadisticas.tiempo_promedio).length > 0 
                      ? `${Math.round(Object.values(estadisticas.tiempo_promedio).reduce((a, b) => a + b, 0) / Object.values(estadisticas.tiempo_promedio).length)}m`
                      : '0m'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de incidencias */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Registro de Incidencias
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pabellón
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidenciasFiltradas.map((incidencia) => (
                  <tr key={incidencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFechaHora(incidencia.fecha_hora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incidencia.usuario_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPorSede(incidencia.sede)}`}>
                        {incidencia.sede}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incidencia.pabellon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPorTipoActividad(incidencia.tipo_actividad)}`}>
                        {incidencia.tipo_actividad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incidencia.equipo_afectado || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incidencia.tiempo_aproximado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {incidenciasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay incidencias</h3>
              <p className="mt-1 text-sm text-gray-500">
                {busqueda ? 'No se encontraron resultados para la búsqueda.' : 'No hay incidencias que coincidan con los filtros aplicados.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
