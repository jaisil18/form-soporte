'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getIncidencias } from '@/lib/supabase';
import type { Incidencia } from '@/types';
import { formatearFechaHora, obtenerColorPorTipoActividad, obtenerColorPorSede } from '@/lib/utils';

export default function ReportesPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(10);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const incidenciasData = await getIncidencias({});
      setIncidencias(incidenciasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  }, []);

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
      <div className="mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Análisis de incidencias registradas</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar incidencias..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Paginación Superior */}
      {incidenciasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border border-gray-200 rounded-lg shadow mb-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              Página {paginaActual} de {totalPaginas}
            </div>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Lista de incidencias - Responsive */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {incidenciasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay incidencias</h3>
            <p className="mt-1 text-sm text-gray-500">
              {busqueda ? 'No se encontraron resultados para la búsqueda.' : 'No hay incidencias registradas.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {incidenciasPaginadas.map((incidencia) => (
              <div key={incidencia.id} className="p-4 sm:p-6 hover:bg-gray-50">
                {/* Vista móvil */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {incidencia.usuario_nombre || 'Usuario desconocido'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {incidencia.usuario_email}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPorSede(incidencia.sede)}`}>
                        {incidencia.sede}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-900">{incidencia.pabellon}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${obtenerColorPorTipoActividad(incidencia.tipo_actividad)}`}>
                        {incidencia.tipo_actividad}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{incidencia.tiempo_aproximado}</div>
                      <div className="text-xs text-gray-500">{formatearFechaHora(incidencia.fecha_hora)}</div>
                    </div>
                  </div>
                </div>

                {/* Vista desktop */}
                <div className="hidden sm:grid sm:grid-cols-6 sm:gap-4">
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-900">
                      {incidencia.usuario_nombre || 'Usuario desconocido'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {incidencia.usuario_email}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPorSede(incidencia.sede)}`}>
                      {incidencia.sede}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm text-gray-900">
                    {incidencia.pabellon}
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPorTipoActividad(incidencia.tipo_actividad)}`}>
                      {incidencia.tipo_actividad}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="text-sm text-gray-900">{incidencia.tiempo_aproximado}</div>
                    <div className="text-xs text-gray-500">{formatearFechaHora(incidencia.fecha_hora)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {incidenciasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border border-gray-200 rounded-lg shadow mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              Página {paginaActual} de {totalPaginas}
            </div>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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