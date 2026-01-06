'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Clock,
  Download,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useResponsive } from '@/hooks/useResponsive';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  // const { isMobile, isTablet } = useResponsive();
  const [usuario, setUsuario] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
    };
    obtenerUsuario();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();

      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error);
      }

      // Limpiar localStorage y sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Redirigir al login
      router.push('/admin/login');

      // Forzar recarga de la página para limpiar completamente el estado
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 100);

    } catch (error) {
      console.error('Error durante el logout:', error);
      // Redirigir de todas formas
      router.push('/admin/login');
    }
  };

  const menuItems = [
    {
      titulo: 'Dashboard',
      ruta: '/admin',
      icono: LayoutDashboard,
      descripcion: 'Vista principal con gráficos y estadísticas'
    },
    {
      titulo: 'Reportes',
      ruta: '/admin/reportes',
      icono: FileText,
      descripcion: 'Ver gráficos, tablas y análisis'
    },
    {
      titulo: 'Configuración del Formulario',
      ruta: '/admin/configuracion',
      icono: Settings,
      descripcion: 'Gestionar sedes, pabellones, tipos'
    },
    {
      titulo: 'Gestión de Usuarios',
      ruta: '/admin/usuarios',
      icono: Users,
      descripcion: 'Administrar usuarios de soporte'
    },
    {
      titulo: 'Gestión de Horarios',
      ruta: '/admin/horarios',
      icono: Clock,
      descripcion: 'Configurar horarios de disponibilidad'
    },
    {
      titulo: 'Exportación de Datos',
      ruta: '/admin/exportacion',
      icono: Download,
      descripcion: 'Exportar reportes a Excel'
    }
  ];

  const navegarA = (ruta: string) => {
    router.push(ruta);

    // Cerrar sidebar después de navegar
    onToggle();
  };

  const isActive = (ruta: string) => {
    if (ruta === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(ruta);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
        w-64 lg:w-64
      `}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
              <Image
                src="/isologo_uct.png"
                alt="Logo UCT"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin UCT</h1>
              <p className="text-xs text-gray-500">Sistema de Incidencias</p>
            </div>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item, index) => {
            const IconComponent = item.icono;
            const activo = isActive(item.ruta);

            return (
              <button
                key={index}
                onClick={() => navegarA(item.ruta)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${activo
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 mr-3 ${activo ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.titulo}</span>
                {activo && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </nav>


        {/* Footer con usuario y logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {usuario?.email || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500">Conectado</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
