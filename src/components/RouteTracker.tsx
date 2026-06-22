'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Evitar registrar rutas administrativas, APIs, estáticos o páginas de autenticación
    const isIgnored = 
      pathname.startsWith('/admin') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.') ||
      pathname === '/login' ||
      pathname === '/signup';

    if (isIgnored) return;

    // Registrar la visita al path actual
    fetch('/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: pathname }),
    }).catch((err) => {
      // Ignorar errores silenciosamente para no afectar la experiencia del usuario
      console.warn('Failed to track route:', err);
    });
  }, [pathname]);

  return null; // Componente invisible
}
