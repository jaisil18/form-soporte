'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Filter, 
  BarChart3,
  PieChart,
  Users,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getIncidencias, getEstadisticasReporte } from '@/lib/supabase';
import { exportarIncidenciasExcel, exportarEstadisticasExcel } from '@/lib/exportarExcel';
import type { Incidencia, EstadisticasReporte, FiltrosReporte } from '@/types';
import { formatearFechaHora, obtenerColorPorTipoActividad, obtenerColorPorSede } from '@/lib/utils';

export default function ReportesPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [filtros, setFiltros] = useState<FiltrosReporte>({});
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(10);

  const cargarDatos = useCallback(async () => {
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
  }, [filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrar incidencias por búsqueda
  const incidenciasFiltradas = incidencias.filter(incidencia => {
    if (!busqueda) return true;
    
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      incidencia.usuario_nombre?.toLowerCase().includes(terminoBusqueda) ||
      incidencia.usuario_email?.toLowerCase().includes(terminoBusqueda) ||
      incidencia.sede?.toLowerCase().includes(terminoBusqueda) ||
      incidencia.pabellon?.toLowerCase().includes(terminoBusqueda) ||
      incidencia.tipo_actividad?.toLowerCase().includes(terminoBusqueda) ||
      incidencia.ambiente_incidencia?.toLowerCase().includes(terminoBusqueda)
    );
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(incidenciasFiltradas.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = indiceInicio + elementosPorPagina;
  const incidenciasPaginadas = incidenciasFiltradas.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportarIncidencias = () => {
    exportarIncidenciasExcel(incidencias);
  };

  const handleExportarEstadisticas = () => {
    if (estadisticas) {
      exportarEstadisticasExcel(estadisticas as unknown as Record<string, unknown>);
    }
  };


  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título de la página */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
            <p className="text-gray-600 mt-2">Análisis de incidencias registradas</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtros.fecha_desde || ''}
                onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtros.fecha_hasta || ''}
                onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sede
              </label>
              <select
                value={filtros.sede || ''}
                onChange={(e) => setFiltros({...filtros, sede: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las sedes</option>
                <option value="Moche">Moche</option>
                <option value="Trujillo">Trujillo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Actividad
              </label>
              <select
                value={filtros.tipo_actividad || ''}
                onChange={(e) => setFiltros({...filtros, tipo_actividad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="Incidencia">Incidencia</option>
                <option value="Solicitud">Solicitud</option>
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
      )}

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

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar incidencias..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Paginación Superior */}
      {incidenciasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg shadow mb-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{indiceInicio + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(indiceFin, incidenciasFiltradas.length)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{incidenciasFiltradas.length}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        onClick={() => cambiarPagina(numero)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          numero === paginaActual
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {numero}
                      </button>
                    );
                  } else if (
                    numero === paginaActual - 2 ||
                    numero === paginaActual + 2
                  ) {
                    return (
                      <span
                        key={numero}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de incidencias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidenciasPaginadas.map((incidencia) => (
                <tr key={incidencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {incidencia.usuario_nombre || 'Usuario desconocido'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {incidencia.usuario_email}
                    </div>
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
                    {formatearFechaHora(incidencia.fecha_hora)}
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

      {/* Paginación */}
      {incidenciasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{indiceInicio + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(indiceFin, incidenciasFiltradas.length)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{incidenciasFiltradas.length}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        onClick={() => cambiarPagina(numero)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          numero === paginaActual
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {numero}
                      </button>
                    );
                  } else if (
                    numero === paginaActual - 2 ||
                    numero === paginaActual + 2
                  ) {
                    return (
                      <span
                        key={numero}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}