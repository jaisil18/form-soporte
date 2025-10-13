'use client';

import { useState } from 'react';
import { ArrowRight, User, ChevronDown } from 'lucide-react';
import { obtenerIniciales } from '@/lib/utils';
import type { UsuarioSoporte } from '@/types';

interface Paso1SeleccionUsuarioProps {
  usuarios: UsuarioSoporte[];
  usuarioSeleccionado: UsuarioSoporte | null;
  onSeleccionarUsuario: (usuario: UsuarioSoporte) => void;
  onSiguiente: () => void;
}

export default function Paso1SeleccionUsuario({
  usuarios,
  usuarioSeleccionado,
  onSeleccionarUsuario,
  onSiguiente
}: Paso1SeleccionUsuarioProps) {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const handleSeleccionarUsuario = (usuario: UsuarioSoporte) => {
    onSeleccionarUsuario(usuario);
    setMostrarDropdown(false);
  };

  const handleSiguiente = () => {
    if (usuarioSeleccionado) {
      onSiguiente();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selección del Usuario
        </h2>
        
        <p className="text-gray-600">
          Estimado(a) auxiliar/asistente de soporte, se le solicita completar el siguiente formulario para el registro de incidencias detectadas.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccione su nombre: <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                {usuarioSeleccionado ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {obtenerIniciales(usuarioSeleccionado.nombre_completo)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {usuarioSeleccionado.nombre_completo}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">
                    Seleccione un usuario de la lista
                  </span>
                )}
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                  mostrarDropdown ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            {mostrarDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {usuarios.map((usuario) => (
                  <button
                    key={usuario.id}
                    type="button"
                    onClick={() => handleSeleccionarUsuario(usuario)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      usuarioSeleccionado?.id === usuario.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">
                          {obtenerIniciales(usuario.nombre_completo)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {usuario.nombre_completo}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {usuarioSeleccionado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {obtenerIniciales(usuarioSeleccionado.nombre_completo)}
                </span>
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {usuarioSeleccionado.nombre_completo}
                </p>
                <p className="text-sm text-blue-700">
                  Usuario seleccionado correctamente
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          <p className="font-medium mb-1">Información importante:</p>
          <p>
            Cuando envíe este formulario, el propietario verá su nombre y dirección de correo electrónico.
          </p>
          <p className="mt-2">
            <span className="text-red-500">(*)</span> Campos obligatorios
          </p>
        </div>
      </div>

      {/* Botón de navegación */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSiguiente}
          disabled={!usuarioSeleccionado}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            usuarioSeleccionado
              ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continuar</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
