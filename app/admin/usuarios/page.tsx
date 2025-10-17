'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Edit,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { getUsuariosSoporte, createUsuarioSoporte, updateUsuarioSoporte } from '@/lib/supabase';
import { obtenerIniciales } from '@/lib/utils';
import type { UsuarioSoporte } from '@/types';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioSoporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioSoporte | null>(null);
  const [formulario, setFormulario] = useState({
    nombre_completo: '',
    email: '',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const usuariosData = await getUsuariosSoporte();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (usuarioEditando) {
        await updateUsuarioSoporte(usuarioEditando.id, formulario);
      } else {
        await createUsuarioSoporte(formulario);
      }
      
      await cargarUsuarios();
      setMostrarFormulario(false);
      setUsuarioEditando(null);
      setFormulario({ nombre_completo: '', email: '', activo: true });
      alert('Usuario guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleEditarUsuario = (usuario: UsuarioSoporte) => {
    setUsuarioEditando(usuario);
    setFormulario({
      nombre_completo: usuario.nombre_completo,
      email: usuario.email || '',
      activo: usuario.activo
    });
    setMostrarFormulario(true);
  };

  const handleEliminarUsuario = async (usuario: UsuarioSoporte) => {
    if (!confirm(`¿Está seguro de que desea eliminar al usuario ${usuario.nombre_completo}?`)) {
      return;
    }

    try {
      await updateUsuarioSoporte(usuario.id, { activo: false });
      await cargarUsuarios();
      alert('Usuario desactivado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleActivarUsuario = async (usuario: UsuarioSoporte) => {
    try {
      await updateUsuarioSoporte(usuario.id, { activo: true });
      await cargarUsuarios();
      alert('Usuario activado exitosamente');
    } catch (error) {
      console.error('Error al activar usuario:', error);
      alert('Error al activar el usuario');
    }
  };

  const cancelarEdicion = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
    setFormulario({ nombre_completo: '', email: '', activo: true });
  };

  if (cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">Administrar usuarios de soporte</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push('/admin/usuarios/administradores')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm">Administradores</span>
            </button>
            
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de usuarios */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Usuarios de Soporte ({usuarios.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {obtenerIniciales(usuario.nombre_completo)}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {usuario.nombre_completo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {usuario.email || 'Sin email'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Registrado: {new Date(usuario.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditarUsuario(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {usuario.activo ? (
                            <button
                              onClick={() => handleEliminarUsuario(usuario)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desactivar usuario"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivarUsuario(usuario)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar usuario"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {usuarios.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comience agregando un nuevo usuario de soporte.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de usuario */}
          <div className="lg:col-span-1">
            {mostrarFormulario && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                </div>

                <form onSubmit={handleCrearUsuario} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formulario.nombre_completo}
                      onChange={(e) => setFormulario(prev => ({ ...prev, nombre_completo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: JUAN PÉREZ GARCÍA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formulario.email}
                      onChange={(e) => setFormulario(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="usuario@uct.edu.pe"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formulario.activo}
                        onChange={(e) => setFormulario(prev => ({ ...prev, activo: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Usuario activo</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4 inline mr-2" />
                      Guardar
                    </button>
                    
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Información */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información sobre Usuarios
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900">Usuarios Activos</h4>
                  <p>Pueden ser seleccionados en el formulario de incidencias.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Usuarios Inactivos</h4>
                  <p>No aparecen en la lista de selección del formulario.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Email Opcional</h4>
                  <p>El campo de email es opcional y se puede agregar después.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
