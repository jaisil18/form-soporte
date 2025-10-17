'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Settings,
  Building,
  MapPin,
  Activity,
  Monitor,
  Clock
} from 'lucide-react';
import { getOpcionesFormulario, updateOpcionesFormulario } from '@/lib/supabase';
import type { OpcionesFormulario } from '@/types';

export default function ConfiguracionPage() {
  const [opciones, setOpciones] = useState<OpcionesFormulario | null>(null);
  const [opcionesEditadas, setOpcionesEditadas] = useState<OpcionesFormulario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActivo, setTabActivo] = useState('sedes');

  useEffect(() => {
    cargarOpciones();
  }, []);

  const cargarOpciones = async () => {
    try {
      const opcionesData = await getOpcionesFormulario();
      setOpciones(opcionesData);
      setOpcionesEditadas(opcionesData);
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async () => {
    if (!opcionesEditadas) return;

    try {
      setGuardando(true);
      await updateOpcionesFormulario(opcionesEditadas);
      setOpciones(opcionesEditadas);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const agregarItem = (seccion: keyof OpcionesFormulario, item: string) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      if (Array.isArray(prev[seccion])) {
        const nuevasOpciones = {
          ...prev,
          [seccion]: [...(prev[seccion] as string[]), item]
        };

        // Si se agrega una nueva sede, crear automáticamente su entrada en pabellones
        if (seccion === 'sedes') {
          nuevasOpciones.pabellones = {
            ...prev.pabellones,
            [item]: prev.pabellones[item] || [] // Solo crear si no existe
          };
        }

        // Si se agrega un nuevo tipo de incidencia, crear automáticamente su entrada en equipos
        if (seccion === 'tipos_incidencia') {
          nuevasOpciones.equipos = {
            ...prev.equipos,
            [item]: prev.equipos[item] || [] // Solo crear si no existe
          };
        }

        return nuevasOpciones;
      }

      return prev;
    });
  };

  const eliminarItem = (seccion: keyof OpcionesFormulario, index: number) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      if (Array.isArray(prev[seccion])) {
        const itemAEliminar = (prev[seccion] as string[])[index];
        
        const nuevasOpciones = {
          ...prev,
          [seccion]: (prev[seccion] as string[]).filter((_, i) => i !== index)
        };

        // Si se elimina una sede, eliminar también su entrada en pabellones
        if (seccion === 'sedes') {
          const nuevosPabellones = { ...prev.pabellones };
          delete nuevosPabellones[itemAEliminar];
          nuevasOpciones.pabellones = nuevosPabellones;
        }

        // Si se elimina un tipo de incidencia, eliminar también su entrada en equipos
        if (seccion === 'tipos_incidencia') {
          const nuevosEquipos = { ...prev.equipos };
          delete nuevosEquipos[itemAEliminar];
          nuevasOpciones.equipos = nuevosEquipos;
        }

        return nuevasOpciones;
      }

      return prev;
    });
  };

  const agregarPabellon = (sede: string, pabellon: string) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      return {
        ...prev,
        pabellones: {
          ...prev.pabellones,
          [sede]: [...(prev.pabellones[sede] || []), pabellon]
        },
        // Crear automáticamente una entrada vacía en ambientes para el nuevo pabellón
        ambientes: {
          ...prev.ambientes,
          [pabellon]: prev.ambientes[pabellon] || [] // Solo crear si no existe
        }
      };
    });
  };

  const eliminarPabellon = (sede: string, index: number) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      const pabellonAEliminar = prev.pabellones[sede][index];
      const nuevosAmbientes = { ...prev.ambientes };
      delete nuevosAmbientes[pabellonAEliminar];

      return {
        ...prev,
        pabellones: {
          ...prev.pabellones,
          [sede]: prev.pabellones[sede].filter((_, i) => i !== index)
        },
        // Eliminar también la entrada correspondiente en ambientes
        ambientes: nuevosAmbientes
      };
    });
  };

  const agregarAmbiente = (pabellon: string, ambiente: string) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      return {
        ...prev,
        ambientes: {
          ...prev.ambientes,
          [pabellon]: [...(prev.ambientes[pabellon] || []), ambiente]
        }
      };
    });
  };

  const eliminarAmbiente = (pabellon: string, index: number) => {
    if (!opcionesEditadas) return null;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      return {
        ...prev,
        ambientes: {
          ...prev.ambientes,
          [pabellon]: prev.ambientes[pabellon].filter((_, i) => i !== index)
        }
      };
    });
  };

  const agregarEquipo = (tipoIncidencia: string, equipo: string) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      return {
        ...prev,
        equipos: {
          ...prev.equipos,
          [tipoIncidencia]: [...(prev.equipos[tipoIncidencia] || []), equipo]
        }
      };
    });
  };

  const eliminarEquipo = (tipoIncidencia: string, index: number) => {
    if (!opcionesEditadas) return;

    setOpcionesEditadas(prev => {
      if (!prev) return null;

      return {
        ...prev,
        equipos: {
          ...prev.equipos,
          [tipoIncidencia]: prev.equipos[tipoIncidencia].filter((_, i) => i !== index)
        }
      };
    });
  };

  const tabs = [
    { id: 'sedes', titulo: 'Sedes', icono: Building },
    { id: 'pabellones', titulo: 'Pabellones', icono: MapPin },
    { id: 'tipos_actividad', titulo: 'Tipos de Actividad', icono: Activity },
    { id: 'ambientes', titulo: 'Ambientes', icono: Settings },
    { id: 'tipos_incidencia', titulo: 'Tipos de Incidencia', icono: Monitor },
    { id: 'equipos', titulo: 'Equipos', icono: Settings },
    { id: 'tiempos_aproximados', titulo: 'Tiempos', icono: Clock }
  ];

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!opcionesEditadas) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar la configuración</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración del Formulario</h1>
            <p className="text-gray-600 mt-2">Gestionar opciones y categorías del formulario</p>
          </div>
          
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              guardando
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icono;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActivo(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tabActivo === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.titulo}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          {/* Sedes */}
          {tabActivo === 'sedes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Sedes</h3>
              <div className="space-y-4">
                {opcionesEditadas.sedes.map((sede, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{sede}</span>
                    <button
                      onClick={() => eliminarItem('sedes', index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nueva sede"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          agregarItem('sedes', input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value && input.value.trim()) {
                        agregarItem('sedes', input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pabellones */}
          {tabActivo === 'pabellones' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Pabellones por Sede</h3>
              <div className="space-y-6">
                {opcionesEditadas.sedes.map((sede) => (
                  <div key={sede} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{sede}</h4>
                    <div className="space-y-2">
                      {(opcionesEditadas.pabellones[sede] || []).map((pabellon, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{pabellon}</span>
                          <button
                            onClick={() => eliminarPabellon(sede, index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nuevo pabellón"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                agregarPabellon(sede, input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            if (input && input.value && input.value.trim()) {
                              agregarPabellon(sede, input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de Actividad */}
          {tabActivo === 'tipos_actividad' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Tipos de Actividad</h3>
              <div className="space-y-4">
                {opcionesEditadas.tipos_actividad.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{tipo}</span>
                    <button
                      onClick={() => eliminarItem('tipos_actividad', index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo tipo de actividad"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          agregarItem('tipos_actividad', input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value && input.value.trim()) {
                        agregarItem('tipos_actividad', input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ambientes */}
          {tabActivo === 'ambientes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Ambientes por Pabellón</h3>
              <div className="space-y-6">
                {Object.entries(opcionesEditadas.ambientes).map(([pabellon, ambientes]) => (
                  <div key={pabellon} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{pabellon}</h4>
                    <div className="space-y-2">
                      {ambientes.map((ambiente, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{ambiente}</span>
                          <button
                            onClick={() => eliminarAmbiente(pabellon, index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nuevo ambiente"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                agregarAmbiente(pabellon, input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            if (input && input.value && input.value.trim()) {
                              agregarAmbiente(pabellon, input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de Incidencia */}
          {tabActivo === 'tipos_incidencia' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Tipos de Incidencia</h3>
              <div className="space-y-4">
                {opcionesEditadas.tipos_incidencia.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{tipo}</span>
                    <button
                      onClick={() => eliminarItem('tipos_incidencia', index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo tipo de incidencia"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          agregarItem('tipos_incidencia', input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value && input.value.trim()) {
                        agregarItem('tipos_incidencia', input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Equipos */}
          {tabActivo === 'equipos' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Equipos por Tipo de Incidencia</h3>
              <div className="space-y-6">
                {Object.entries(opcionesEditadas.equipos).map(([tipoIncidencia, equipos]) => (
                  <div key={tipoIncidencia} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{tipoIncidencia}</h4>
                    <div className="space-y-2">
                      {equipos.map((equipo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{equipo}</span>
                          <button
                            onClick={() => eliminarEquipo(tipoIncidencia, index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nuevo equipo"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                agregarEquipo(tipoIncidencia, input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            if (input && input.value && input.value.trim()) {
                              agregarEquipo(tipoIncidencia, input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tiempos Aproximados */}
          {tabActivo === 'tiempos_aproximados' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Tiempos Aproximados</h3>
              <div className="space-y-4">
                {opcionesEditadas.tiempos_aproximados.map((tiempo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{tiempo}</span>
                    <button
                      onClick={() => eliminarItem('tiempos_aproximados', index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo tiempo aproximado"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          agregarItem('tiempos_aproximados', input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value && input.value.trim()) {
                        agregarItem('tiempos_aproximados', input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}