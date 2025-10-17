'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, User, Building, MapPin, Activity, Settings, Monitor, Clock } from 'lucide-react';
import { getOpcionesFormulario, getUsuariosSoporte, createIncidencia } from '@/lib/supabase';
import { obtenerIniciales } from '@/lib/utils';
import type { UsuarioSoporte, FormularioData, OpcionesFormulario } from '@/types';

interface FormularioMultiPasoProps {
  onVolver: () => void;
}

interface Paso {
  id: string;
  titulo: string;
  pregunta: string;
  icono: React.ComponentType<any>;
  campo: keyof FormularioData;
  esObligatorio: boolean;
  tipoInput?: 'dropdown' | 'botones';
}

export default function FormularioMultiPaso({ onVolver }: FormularioMultiPasoProps) {
  const [pasoActual, setPasoActual] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioSoporte[]>([]);
  const [opciones, setOpciones] = useState<OpcionesFormulario | null>(null);
  const [datosFormulario, setDatosFormulario] = useState<Partial<FormularioData>>({});
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  const [animacionEntrada, setAnimacionEntrada] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosData, opcionesData] = await Promise.all([
          getUsuariosSoporte(),
          getOpcionesFormulario()
        ]);
        setUsuarios(usuariosData);
        setOpciones(opcionesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    setAnimacionEntrada(true);
    const timer = setTimeout(() => setAnimacionEntrada(false), 300);
    return () => clearTimeout(timer);
  }, [pasoActual]);

  const pasos: Paso[] = [
    {
      id: 'usuario',
      titulo: 'Usuario',
      pregunta: '¿Quién está reportando la incidencia?',
      icono: User,
      campo: 'usuario_id',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'sede',
      titulo: 'Sede',
      pregunta: '¿En qué sede ocurrió la incidencia?',
      icono: Building,
      campo: 'sede',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'pabellon',
      titulo: 'Pabellón',
      pregunta: '¿En qué pabellón específico?',
      icono: MapPin,
      campo: 'pabellon',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'tipo_actividad',
      titulo: 'Tipo de Actividad',
      pregunta: '¿Qué tipo de actividad necesita reportar?',
      icono: Activity,
      campo: 'tipo_actividad',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'ambiente',
      titulo: 'Ambiente',
      pregunta: '¿En qué ambiente específico ocurrió?',
      icono: Settings,
      campo: 'ambiente_incidencia',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'tipo_incidencia',
      titulo: 'Tipo de Incidencia',
      pregunta: '¿Qué tipo de incidencia es?',
      icono: Monitor,
      campo: 'tipo_incidencia',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'equipo',
      titulo: 'Equipo',
      pregunta: '¿Qué equipo está afectado?',
      icono: Settings,
      campo: 'equipo_afectado',
      esObligatorio: true,
      tipoInput: 'botones'
    },
    {
      id: 'tiempo',
      titulo: 'Tiempo',
      pregunta: '¿Cuánto tiempo tomará resolver esto?',
      icono: Clock,
      campo: 'tiempo_aproximado',
      esObligatorio: true,
      tipoInput: 'botones'
    }
  ];

  const paso = pasos[pasoActual];
  const esUltimoPaso = pasoActual === pasos.length - 1;

  const obtenerOpciones = (campo: string) => {
    if (!opciones) return [];
    
    switch (campo) {
      case 'usuario_id':
        return usuarios.map(usuario => usuario.nombre_completo);
      case 'sede':
        return opciones.sedes;
      case 'pabellon':
        return datosFormulario.sede ? (opciones.pabellones[datosFormulario.sede] || []) : [];
      case 'tipo_actividad':
        return opciones.tipos_actividad;
      case 'ambiente_incidencia':
        if (datosFormulario.pabellon && opciones.ambientes[datosFormulario.pabellon]) {
          return opciones.ambientes[datosFormulario.pabellon];
        }
        return Object.values(opciones.ambientes).flat().filter((v, i, a) => a.indexOf(v) === i);
      case 'tipo_incidencia':
        return opciones.tipos_incidencia;
      case 'equipo_afectado':
        return datosFormulario.tipo_incidencia ? (opciones.equipos[datosFormulario.tipo_incidencia] || []) : [];
      case 'tiempo_aproximado':
        return opciones.tiempos_aproximados;
      default:
        return [];
    }
  };

  const obtenerValor = (campo: string) => {
    if (campo === 'usuario_id') {
      return usuarios.find(u => u.id === datosFormulario.usuario_id)?.nombre_completo || '';
    }
    return datosFormulario[campo as keyof FormularioData] || '';
  };

  const handleSeleccionar = (valor: string) => {
    if (paso.campo === 'usuario_id') {
      const usuario = usuarios.find(u => u.nombre_completo === valor);
      if (usuario) {
        setDatosFormulario(prev => ({
          ...prev,
          usuario_id: usuario.id,
          usuario_nombre: usuario.nombre_completo,
          usuario_email: usuario.email
        }));
      }
    } else {
      setDatosFormulario(prev => ({ ...prev, [paso.campo]: valor }));
    }
    setDropdownAbierto(null);
  };

  const puedeContinuar = () => {
    if (!paso.esObligatorio) return true;
    const valor = datosFormulario[paso.campo];
    return valor && valor !== '';
  };

  const handleSiguiente = () => {
    if (puedeContinuar()) {
      if (esUltimoPaso) {
        enviarFormulario();
      } else {
        setPasoActual(prev => prev + 1);
      }
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(prev => prev - 1);
    }
  };

  const enviarFormulario = async () => {
    setCargando(true);
    try {
      const datosCompletos: FormularioData = {
        usuario_id: datosFormulario.usuario_id!,
        usuario_nombre: datosFormulario.usuario_nombre!,
        usuario_email: datosFormulario.usuario_email!,
        sede: datosFormulario.sede!,
        pabellon: datosFormulario.pabellon || null,
        tipo_actividad: datosFormulario.tipo_actividad!,
        ambiente_incidencia: datosFormulario.ambiente_incidencia || undefined,
        tipo_incidencia: datosFormulario.tipo_incidencia || undefined,
        equipo_afectado: datosFormulario.equipo_afectado || undefined,
        tiempo_aproximado: datosFormulario.tiempo_aproximado!,
        fecha_hora: new Date().toISOString()
      };

      await createIncidencia(datosCompletos);
      setEnviado(true);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Error al enviar el formulario. Por favor intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-700 ${
          animacionEntrada ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Formulario Enviado!
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Su incidencia ha sido registrada exitosamente. 
              El equipo de soporte revisará su solicitud a la brevedad.
            </p>

            <div className="space-y-4">
              <button
                onClick={onVolver}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Volver al Inicio
              </button>
              
              <button
                onClick={() => {
                  setEnviado(false);
                  setPasoActual(0);
                  setDatosFormulario({});
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Registrar Otra Incidencia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!opciones || usuarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  const opcionesDisponibles = obtenerOpciones(paso.campo);
  const valorActual = obtenerValor(paso.campo);
  const IconComponent = paso.icono;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header con progreso */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onVolver}
              className="flex items-center gap-2 text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver</span>
            </button>
            
            <div className="text-white text-right">
              <p className="text-sm opacity-80">Paso {pasoActual + 1} de {pasos.length}</p>
              <p className="font-semibold">{paso.titulo}</p>
            </div>
          </div>

          {/* Barra de progreso animada */}
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className={`bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500 ${
          animacionEntrada ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          {/* Icono y pregunta */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <IconComponent className="h-10 w-10 text-blue-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {paso.pregunta}
            </h2>
            
            <p className="text-gray-600 text-lg">
              Selecciona una opción <span className="text-red-500 font-semibold">*</span>
            </p>
          </div>

          {/* Campo de selección */}
          <div className="mb-8">
            {paso.tipoInput === 'botones' ? (
              /* Renderizado con botones */
              <div className={`grid gap-3 ${
                paso.campo === 'usuario_id' 
                  ? 'grid-cols-1' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {opcionesDisponibles.length > 0 ? (
                  opcionesDisponibles.map((opcion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSeleccionar(opcion)}
                      className={`p-4 rounded-2xl border-2 font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                        valorActual === opcion
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {paso.campo === 'usuario_id' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-600">
                              {obtenerIniciales(opcion)}
                            </span>
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {opcion}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="block text-center">{opcion}</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No hay opciones disponibles
                  </div>
                )}
              </div>
            ) : (
              /* Renderizado con dropdown (comportamiento original) */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownAbierto(dropdownAbierto === paso.campo ? null : paso.campo)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 text-left focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-lg ${valorActual ? 'text-gray-900' : 'text-gray-500'}`}>
                      {valorActual || `Selecciona ${paso.titulo.toLowerCase()}`}
                    </span>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform duration-200 ${
                      dropdownAbierto === paso.campo ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>

                {dropdownAbierto === paso.campo && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-auto">
                    {opcionesDisponibles.length > 0 ? (
                      opcionesDisponibles.map((opcion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSeleccionar(opcion)}
                          className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {paso.campo === 'usuario_id' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">
                                  {obtenerIniciales(opcion)}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{opcion}</span>
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">{opcion}</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-gray-500 text-center">
                        No hay opciones disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between">
            <button
              onClick={handleAnterior}
              disabled={pasoActual === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                pasoActual === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              Anterior
            </button>

            <button
              onClick={handleSiguiente}
              disabled={!puedeContinuar() || cargando}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                puedeContinuar() && !cargando
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  {esUltimoPaso ? 'Enviar Formulario' : 'Continuar'}
                  {!esUltimoPaso && <ArrowRight className="h-5 w-5" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
