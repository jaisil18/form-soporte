'use client';

import { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  Database,
  TrendingUp,
} from 'lucide-react';
import { getIncidencias, getEstadisticasReporte } from '@/lib/supabase';
import { exportarIncidenciasExcel, exportarEstadisticasExcel } from '@/lib/exportarExcel';
import { exportarComoCSV } from '@/lib/utils';
import type { FiltrosReporte } from '@/types';

export default function ExportacionPage() {
  const [filtros, setFiltros] = useState<FiltrosReporte>({});
  const [cargando, setCargando] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState<'incidencias' | 'estadisticas' | 'csv'>('incidencias');

  const handleExportar = async () => {
    setCargando(true);
    
    try {
      if (tipoExportacion === 'csv') {
        const incidencias = await getIncidencias(filtros);
        const fechaActual = new Date().toLocaleDateString('es-PE', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-');
        
        exportarComoCSV(incidencias, `Incidencias_UCT_${fechaActual}.csv`);
      } else if (tipoExportacion === 'incidencias') {
        const incidencias = await getIncidencias(filtros);
        exportarIncidenciasExcel(incidencias);
      } else if (tipoExportacion === 'estadisticas') {
        const estadisticas = await getEstadisticasReporte(filtros);
        exportarEstadisticasExcel(estadisticas as unknown as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar los datos');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const opcionesExportacion = [
    {
      id: 'incidencias',
      titulo: 'Exportar Incidencias a Excel',
      descripcion: 'Exporta todas las incidencias con filtros aplicables a un archivo Excel con múltiples hojas',
      icono: FileSpreadsheet,
      color: 'bg-green-600 hover:bg-green-700',
      formato: 'Excel (.xlsx)'
    },
    {
      id: 'estadisticas',
      titulo: 'Exportar Estadísticas a Excel',
      descripcion: 'Exporta estadísticas, gráficos y análisis de incidencias a un archivo Excel',
      icono: TrendingUp,
      color: 'bg-blue-600 hover:bg-blue-700',
      formato: 'Excel (.xlsx)'
    },
    {
      id: 'csv',
      titulo: 'Exportar a CSV',
      descripcion: 'Exporta los datos de incidencias en formato CSV para análisis en otras herramientas',
      icono: Database,
      color: 'bg-purple-600 hover:bg-purple-700',
      formato: 'CSV (.csv)'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título de la página */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exportación de Datos</h1>
          <p className="text-gray-600 mt-2">Exportar reportes y datos en diferentes formatos</p>
        </div>
      </div>

      {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filtros de Exportación</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Aplique filtros para exportar datos específicos
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_desde || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_hasta || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Sede
                  </label>
                  <select
                    value={filtros.sede || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, sede: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las sedes</option>
                    <option value="Moche">Moche</option>
                    <option value="Mansiche">Mansiche</option>
                    <option value="Colón">Colón</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Tipo de Actividad
                  </label>
                  <select
                    value={filtros.tipo_actividad || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tipo_actividad: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Incidencia">Incidencia</option>
                    <option value="Mudanza">Mudanza</option>
                    <option value="Visita técnica/campo">Visita técnica/campo</option>
                    <option value="Soporte evento">Soporte evento</option>
                  </select>
                </div>

                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Información de exportación */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Exportación
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900">Excel con Incidencias</h4>
                  <p>• Datos completos de incidencias</p>
                  <p>• Hoja de resumen con filtros</p>
                  <p>• Columnas separadas y formateadas</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Excel con Estadísticas</h4>
                  <p>• Gráficos y análisis</p>
                  <p>• Múltiples hojas organizadas</p>
                  <p>• Datos para Power BI</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">CSV</h4>
                  <p>• Formato compatible</p>
                  <p>• Para análisis externos</p>
                  <p>• Fácil importación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opciones de exportación */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Seleccione el Tipo de Exportación
                </h2>
                <p className="text-gray-600 mb-6">
                  Elija el formato y tipo de datos que desea exportar
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {opcionesExportacion.map((opcion) => {
                  const IconComponent = opcion.icono;
                  return (
                    <div
                      key={opcion.id}
                      onClick={() => setTipoExportacion(opcion.id as 'incidencias' | 'estadisticas' | 'csv')}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        tipoExportacion === opcion.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${opcion.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {opcion.titulo}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {opcion.formato}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {opcion.descripcion}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              tipoExportacion === opcion.id
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-500">
                              {tipoExportacion === opcion.id ? 'Seleccionado' : 'Seleccionar'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón de exportación */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Exportar Datos
                    </h3>
                    <p className="text-gray-600">
                      {tipoExportacion === 'incidencias' && 'Exportará todas las incidencias que coincidan con los filtros aplicados.'}
                      {tipoExportacion === 'estadisticas' && 'Exportará estadísticas y análisis de las incidencias filtradas.'}
                      {tipoExportacion === 'csv' && 'Exportará los datos en formato CSV para análisis externo.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleExportar}
                    disabled={cargando}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      cargando
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {cargando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Exportando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        <span>Exportar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Vista previa de filtros */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Previa de Filtros
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha Desde</p>
                    <p className="font-medium">
                      {filtros.fecha_desde || 'Sin filtrar'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Fecha Hasta</p>
                    <p className="font-medium">
                      {filtros.fecha_hasta || 'Sin filtrar'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Sede</p>
                    <p className="font-medium">
                      {filtros.sede || 'Todas'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Tipo Actividad</p>
                    <p className="font-medium">
                      {filtros.tipo_actividad || 'Todos'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
