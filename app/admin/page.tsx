'use client';

import { useState, useEffect } from 'react';
import { 
  Activity,
  FileText
} from 'lucide-react';
import { getEstadisticasConFiltroTemporal } from '@/lib/supabase';
import type { EstadisticasReporte } from '@/types';
import ReporteTemporal from '@/components/graficos/ReporteTemporal';
import IncidenciasPorUsuario from '@/components/graficos/IncidenciasPorUsuario';
import LugaresMasConcurridos from '@/components/graficos/LugaresMasConcurridos';
import TiempoPromedioSolucion from '@/components/graficos/TiempoPromedioSolucion';
import PabellonMasIncidencias from '@/components/graficos/PabellonMasIncidencias';
import TiposActividadesMasConcurridas from '@/components/graficos/TiposIncidenciasMasConcurridas';
import TiposIncidencias from '@/components/graficos/TiposIncidencias';
import ChartSkeleton from '@/components/ui/ChartSkeleton';
import { useResponsive } from '@/hooks/useResponsive';

export default function AdminDashboard() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [estadisticas, setEstadisticas] = useState<EstadisticasReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados para filtros jerárquicos
  const [añoSeleccionado, setAñoSeleccionado] = useState<number | 'todos'>(new Date().getFullYear());
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<number | 'todos'>(Math.floor(new Date().getMonth() / 3) + 1);
  const [mesSeleccionado, setMesSeleccionado] = useState<number | 'todos'>(new Date().getMonth() + 1);

  // Funciones helper
  const generarOpcionesAños = () => {
    const añoActual = new Date().getFullYear();
    const años = [];
    for (let i = añoActual; i >= 2023; i--) {
      años.push(i);
    }
    return años;
  };

  const generarOpcionesMeses = () => {
    if (trimestreSeleccionado === 'todos') return [];
    
    const mesesPorTrimestre = {
      1: [
        { valor: 1, nombre: 'Enero' },
        { valor: 2, nombre: 'Febrero' },
        { valor: 3, nombre: 'Marzo' }
      ],
      2: [
        { valor: 4, nombre: 'Abril' },
        { valor: 5, nombre: 'Mayo' },
        { valor: 6, nombre: 'Junio' }
      ],
      3: [
        { valor: 7, nombre: 'Julio' },
        { valor: 8, nombre: 'Agosto' },
        { valor: 9, nombre: 'Septiembre' }
      ],
      4: [
        { valor: 10, nombre: 'Octubre' },
        { valor: 11, nombre: 'Noviembre' },
        { valor: 12, nombre: 'Diciembre' }
      ]
    };
    
    return mesesPorTrimestre[trimestreSeleccionado as keyof typeof mesesPorTrimestre] || [];
  };

  const calcularPeriodoFiltro = (): 'mes' | 'trimestre' | 'año' => {
    if (mesSeleccionado !== 'todos') return 'mes';
    if (trimestreSeleccionado !== 'todos') return 'trimestre';
    if (añoSeleccionado !== 'todos') return 'año';
    return 'año'; // Por defecto
  };

  const formatearPeriodoSeleccionado = () => {
    if (mesSeleccionado !== 'todos') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${meses[mesSeleccionado - 1]} ${añoSeleccionado}`;
    }
    if (trimestreSeleccionado !== 'todos') {
      return `Q${trimestreSeleccionado} ${añoSeleccionado}`;
    }
    if (añoSeleccionado !== 'todos') {
      return `Año ${añoSeleccionado}`;
    }
    return 'Todos los períodos';
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Función local para calcular el período
        const calcularPeriodo = (): 'mes' | 'trimestre' | 'año' => {
          if (mesSeleccionado !== 'todos') return 'mes';
          if (trimestreSeleccionado !== 'todos') return 'trimestre';
          if (añoSeleccionado !== 'todos') return 'año';
          return 'año'; // Por defecto
        };

        const periodo = calcularPeriodo();
        const filtrosEspecificos = {
          año: añoSeleccionado,
          trimestre: trimestreSeleccionado,
          mes: mesSeleccionado
        };
        
        console.log('🔍 Dashboard: Cargando datos con filtros:', {
          periodo,
          filtrosEspecificos
        });
        
        const stats = await getEstadisticasConFiltroTemporal(periodo, filtrosEspecificos);
        setEstadisticas(stats);
      } catch (statsError) {
        console.error('Error al cargar estadísticas:', statsError);
        // Mostrar datos vacíos en caso de error
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [añoSeleccionado, trimestreSeleccionado, mesSeleccionado]);

  // Handlers para los selectores
  const handleAñoChange = (valor: string) => {
    const nuevoAño = valor === 'todos' ? 'todos' : parseInt(valor);
    setAñoSeleccionado(nuevoAño);
    
    // Resetear trimestre y mes si se selecciona "Todos"
    if (nuevoAño === 'todos') {
      setTrimestreSeleccionado('todos');
      setMesSeleccionado('todos');
    }
  };

  const handleTrimestreChange = (valor: string) => {
    const nuevoTrimestre = valor === 'todos' ? 'todos' : parseInt(valor);
    setTrimestreSeleccionado(nuevoTrimestre);
    
    // Resetear mes si se selecciona "Todos"
    if (nuevoTrimestre === 'todos') {
      setMesSeleccionado('todos');
    }
  };

  const handleMesChange = (valor: string) => {
    setMesSeleccionado(valor === 'todos' ? 'todos' : parseInt(valor));
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const cardsEstadisticas = [
    {
      titulo: 'Total de Incidencias',
      valor: estadisticas?.total_incidencias || 0,
      icono: FileText,
      color: 'bg-blue-500',
      descripcion: 'Registros totales'
    },
    {
      titulo: 'Incidencias Hoy',
      valor: estadisticas?.tendencia_temporal[estadisticas?.tendencia_temporal.length - 1]?.cantidad || 0,
      icono: Activity,
      color: 'bg-green-500',
      descripcion: 'Registros de hoy'
    }
  ];


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título de la página */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Panel principal con análisis de incidencias</p>
      </div>
        {/* Estadísticas rápidas */}
        <div className={`
          grid gap-6 mb-8
          ${isMobile ? 'grid-cols-1' : ''}
          ${isTablet ? 'grid-cols-1' : ''}
          ${isDesktop ? 'grid-cols-2' : ''}
        `}>
          {cardsEstadisticas.map((card, index) => {
            const IconComponent = card.icono;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className={`flex items-center ${isMobile ? 'flex-col text-center' : ''}`}>
                  <div className={`p-3 rounded-lg ${card.color} ${isMobile ? 'mb-3' : ''}`}>
                    <IconComponent className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} text-white`} />
                  </div>
                  <div className={`${isMobile ? '' : 'ml-4'}`}>
                    <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-600`}>{card.titulo}</p>
                    <p className={`${isMobile ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900`}>{card.valor}</p>
                    <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>{card.descripcion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficos de estadísticas */}
        <div id="graficos" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Análisis de Incidencias</h2>
            
            {/* Selectores jerárquicos de período temporal */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* Selector de Año */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Año</label>
                <select
                  value={añoSeleccionado}
                  onChange={(e) => handleAñoChange(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-w-[120px]"
                >
                  <option value="todos">Todos</option>
                  {generarOpcionesAños().map(año => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Trimestre */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Trimestre</label>
                <select
                  value={trimestreSeleccionado}
                  onChange={(e) => handleTrimestreChange(e.target.value)}
                  disabled={añoSeleccionado === 'todos'}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[120px]"
                >
                  <option value="todos">Todos</option>
                  {[1, 2, 3, 4].map(trim => (
                    <option key={trim} value={trim}>Q{trim}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Mes */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Mes</label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => handleMesChange(e.target.value)}
                  disabled={trimestreSeleccionado === 'todos'}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[140px]"
                >
                  <option value="todos">Todos</option>
                  {generarOpcionesMeses().map(mes => (
                    <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Indicador del período seleccionado */}
          <div className="text-sm text-gray-600 mb-4">
            Mostrando datos de: <span className="font-semibold text-blue-600">{formatearPeriodoSeleccionado()}</span>
          </div>
          <div className={`
            grid gap-6
            ${isMobile ? 'grid-cols-1' : ''}
            ${isTablet ? 'grid-cols-1' : ''}
            ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : ''}
          `}>
            {cargando ? (
                  <>
                    <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Reporte Temporal" />
                    <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Incidencias por Persona" />
                    <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Lugares Más Concurridos" />
                    <ChartSkeleton height={isMobile ? 300 : isTablet ? 320 : 350} title="Tiempo Promedio de Solución" />
                    <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Pabellón con Más Incidencias" />
                    <ChartSkeleton height={isMobile ? 300 : isTablet ? 320 : 350} title="Tipos de Actividades Más Concurridas" />
                    <ChartSkeleton height={isMobile ? 250 : isTablet ? 300 : 350} title="Tipos de Incidencias" />
                  </>
            ) : (
              <>
                <ReporteTemporal estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <IncidenciasPorUsuario estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <LugaresMasConcurridos estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <TiempoPromedioSolucion estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <PabellonMasIncidencias estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <TiposActividadesMasConcurridas estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
                <TiposIncidencias estadisticas={estadisticas} periodo={calcularPeriodoFiltro()} />
              </>
            )}
          </div>
        </div>

    </div>
  );
}

