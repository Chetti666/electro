export interface PathInfo {
  label: string;
  category: 'Calculadora' | 'Informe' | 'Blog' | 'Sistema' | 'General';
  color: string;
}

export function getPathInfo(path: string): PathInfo {
  if (path === '/') {
    return { label: 'Inicio', category: 'General', color: 'var(--primary-light)' };
  }
  if (path === '/about') {
    return { label: 'Sobre Nosotros', category: 'General', color: 'var(--foreground-muted)' };
  }
  if (path === '/contact') {
    return { label: 'Contacto', category: 'General', color: 'var(--foreground-muted)' };
  }
  if (path === '/login') {
    return { label: 'Iniciar Sesión', category: 'Sistema', color: 'var(--foreground-dim)' };
  }
  if (path === '/signup') {
    return { label: 'Registrarse', category: 'Sistema', color: 'var(--foreground-dim)' };
  }
  
  if (path === '/blog') {
    return { label: 'Blog (Lista)', category: 'Blog', color: 'var(--warning)' };
  }
  if (path.startsWith('/blog/')) {
    const slug = path.substring(6);
    const formattedSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { label: `Artículo: ${formattedSlug}`, category: 'Blog', color: 'var(--warning)' };
  }

  if (path === '/calculadoras') {
    return { label: 'Calculadoras (Lista)', category: 'Calculadora', color: 'var(--primary-light)' };
  }
  if (path.startsWith('/calculadoras/')) {
    const calc = path.substring(14);
    switch (calc) {
      case 'seccion':
        return { label: 'Cálculo de Sección', category: 'Calculadora', color: '#3b82f6' }; // var(--primary-light)
      case 'caida-tension':
        return { label: 'Cálculo de Caída de Tensión', category: 'Calculadora', color: '#10b981' }; // emerald
      case 'seccion-ric':
        return { label: 'Corriente Admisible por RIC', category: 'Calculadora', color: '#f59e0b' }; // amber
      case 'empalmes':
        return { label: 'Buscador de Empalmes', category: 'Calculadora', color: '#ef4444' }; // red
      case 'calculadora-corriente':
        return { label: 'Cálculo de Corriente', category: 'Calculadora', color: '#a855f7' }; // purple
      case 'rotuladora':
        return { label: 'Generador de Rótulos', category: 'Calculadora', color: '#14b8a6' }; // teal
      default:
        return { label: `Calculadora: ${calc}`, category: 'Calculadora', color: '#3b82f6' };
    }
  }

  if (path === '/informes') {
    return { label: 'Informes (Lista)', category: 'Informe', color: '#14b8a6' };
  }
  if (path.startsWith('/informes/')) {
    const inf = path.substring(10);
    switch (inf) {
      case 'informe-resistividad':
        return { label: 'Informe de Resistividad (SEV)', category: 'Informe', color: '#22c55e' }; // green
      case 'presupuesto':
        return { label: 'Generador de Presupuestos', category: 'Informe', color: '#3b82f6' }; // blue
      case 'informe-fotografico':
        return { label: 'Informe Fotográfico', category: 'Informe', color: '#f59e0b' }; // orange
      case 'informe-inspeccion':
        return { label: 'Informe de Inspección', category: 'Informe', color: '#0ea5e9' }; // sky
      default:
        return { label: `Informe: ${inf}`, category: 'Informe', color: '#14b8a6' };
    }
  }

  return { label: path, category: 'General', color: '#64748b' };
}
