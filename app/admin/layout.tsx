'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detectar si estamos en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true);
    setIsLoginPage(pathname === '/admin/login');
  }, [pathname]);

  // Cerrar sidebar automáticamente en desktop
  useEffect(() => {
    if (isClient) {
      const handleResize = () => {
        const width = window.innerWidth;
        if (width >= 1024) {
          setSidebarOpen(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isClient]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Si estamos en la página de login, no mostrar el layout del admin
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Evitar renderizado hasta que estemos en el cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
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
                <h1 className="text-lg font-bold text-gray-900">UCT</h1>
                <p className="text-xs text-gray-500">UNIVERSIDAD CATÓLICA DE TRUJILLO</p>
              </div>
            </div>
            
            <div className="w-10"></div> {/* Spacer para centrar */}
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
