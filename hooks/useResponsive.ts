'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useResponsive = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Función para manejar el cambio de tamaño
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    }

    // Establecer el tamaño inicial
    handleResize();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
