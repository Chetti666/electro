'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Eye, 
  Globe, 
  Search, 
  Filter, 
  ArrowLeft, 
  Calculator, 
  FileText, 
  BookOpen, 
  Settings, 
  Layout, 
  RefreshCw 
} from 'lucide-react';
import { getPathInfo } from '@/lib/metrics';

interface RouteData {
  id: number;
  path: string;
  visits: number;
  updatedAt: string;
}

interface MetricsResponse {
  totalVisits: number;
  routes: RouteData[];
}

export default function AdminMetricsPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('No autorizado. Debes ser administrador.');
        }
        throw new Error('Error al cargar las métricas.');
      }
      const jsonData = await res.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <RefreshCw className="w-10 h-10 text-primary-light animate-spin mb-4" />
        <p className="text-sm text-foreground-muted">Cargando estadísticas de navegación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-lg mx-auto mt-8 p-8 text-center">
        <p className="text-red-500 font-semibold mb-4">Error: {error}</p>
        <button 
          onClick={() => { setLoading(true); fetchMetrics(); }}
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const routes = data?.routes ?? [];
  const totalSiteVisits = data?.totalVisits ?? 0;

  // Calcular métricas
  const totalPageviews = routes.reduce((acc, route) => acc + route.visits, 0);
  const pageviewsPerSession = totalSiteVisits > 0 ? (totalPageviews / totalSiteVisits).toFixed(1) : '0';

  // Agrupar por Categorías
  const categories = {
    Calculadora: { count: 0, label: 'Calculadoras', color: '#3b82f6', icon: <Calculator className="w-4 h-4" /> },
    Informe: { count: 0, label: 'Informes', color: '#14b8a6', icon: <FileText className="w-4 h-4" /> },
    Blog: { count: 0, label: 'Blog', color: '#f59e0b', icon: <BookOpen className="w-4 h-4" /> },
    Sistema: { count: 0, label: 'Sistema', color: '#64748b', icon: <Settings className="w-4 h-4" /> },
    General: { count: 0, label: 'General / Inicio', color: '#a855f7', icon: <Layout className="w-4 h-4" /> },
  };

  routes.forEach(route => {
    const info = getPathInfo(route.path);
    if (categories[info.category]) {
      categories[info.category].count += route.visits;
    }
  });

  const totalCategorizedVisits = Object.values(categories).reduce((sum, c) => sum + c.count, 0) || 1;

  // Filtrar y Buscar
  const filteredRoutes = routes.filter(route => {
    const info = getPathInfo(route.path);
    const matchesSearch = 
      route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || info.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Top 5 rutas más visitadas (sólo calculadoras o informes o blog, excluyendo sistema y general si es deseado, pero mejor el top 5 absoluto público)
  const topRoutes = [...routes]
    .filter(r => {
      const info = getPathInfo(r.path);
      return info.category !== 'Sistema';
    })
    .slice(0, 5);

  const maxVisits = topRoutes[0]?.visits ?? 1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-primary-light hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al dashboard
          </Link>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-rajdhani)',
              color: 'var(--foreground)',
              letterSpacing: '1px'
            }}
          >
            Monitoreo y Métricas de Tráfico
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Monitorea en tiempo real las herramientas, calculadoras y páginas más populares de vmelectric.cl
          </p>
        </div>
        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="btn btn-outline self-start sm:self-center px-4 py-2 text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center justify-between p-6">
          <div>
            <div className="text-3xl font-bold mb-1 text-primary-light" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {totalSiteVisits.toLocaleString('es-CL')}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
              Visitas del Sitio (Sesiones)
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Usuarios únicos que iniciaron sesión/entrada
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/25 shrink-0">
            <Globe className="w-6 h-6 text-primary-light" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-6">
          <div>
            <div className="text-3xl font-bold mb-1 text-success" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {totalPageviews.toLocaleString('es-CL')}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
              Total Páginas Vistas
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Suma agregada de todas las vistas de páginas
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shrink-0">
            <Eye className="w-6 h-6 text-success" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-6">
          <div>
            <div className="text-3xl font-bold mb-1 text-warning" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {pageviewsPerSession}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
              Páginas / Visita
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Promedio de herramientas vistas por sesión
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 shrink-0">
            <BarChart3 className="w-6 h-6 text-warning" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Distribución por Categorías */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Distribución por Área
            </h2>
            <p className="text-xs text-foreground-dim mb-6">
              Porcentaje de tráfico total según la funcionalidad del sitio
            </p>

            <div className="space-y-4">
              {Object.entries(categories).map(([key, value]) => {
                const percentage = ((value.count / totalCategorizedVisits) * 100).toFixed(1);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="p-1 rounded bg-slate-800 border border-slate-700">
                          {value.icon}
                        </span>
                        <span>{value.label}</span>
                      </div>
                      <div className="font-semibold text-foreground-muted">
                        {value.count.toLocaleString('es-CL')} ({percentage}%)
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: value.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Herramientas más Populares */}
        <div className="card lg:col-span-3 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Top 5 Herramientas y Páginas
            </h2>
            <p className="text-xs text-foreground-dim mb-6">
              Las herramientas más utilizadas y secciones más consultadas por los usuarios
            </p>

            {topRoutes.length === 0 ? (
              <p className="text-xs text-foreground-muted text-center py-12">No hay datos de navegación registrados aún.</p>
            ) : (
              <div className="space-y-4">
                {topRoutes.map((route, index) => {
                  const info = getPathInfo(route.path);
                  const progressPercentage = ((route.visits / maxVisits) * 100).toFixed(0);

                  return (
                    <div key={route.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-800 border border-slate-700 text-foreground-dim">
                            {index + 1}
                          </span>
                          <span className="font-medium text-foreground hover:text-primary-light transition-colors">
                            {info.label}
                          </span>
                          <span className="text-[10px] text-foreground-dim select-none hidden sm:inline">
                            {route.path}
                          </span>
                        </div>
                        <span className="font-bold text-foreground-muted">
                          {route.visits.toLocaleString('es-CL')} vistas
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%`, backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Completa de Rutas */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Detalle Completo de Rutas
            </h2>
            <p className="text-xs text-foreground-dim">
              Listado completo de todas las URLs monitoreadas del sitio
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
              <input
                type="text"
                placeholder="Buscar ruta o etiqueta..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input pl-9 py-2 text-xs w-full sm:w-64"
              />
            </div>

            {/* Selector de Categoría */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="form-select pl-9 py-2 text-xs w-full sm:w-44 appearance-none"
              >
                <option value="ALL">Todas las Áreas</option>
                <option value="Calculadora">Calculadoras</option>
                <option value="Informe">Informes</option>
                <option value="Blog">Blog</option>
                <option value="General">General / Inicio</option>
                <option value="Sistema">Sistema</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto rounded-lg border border-card-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-card-border">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-dim">Nombre / Etiqueta</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-dim">Ruta Relativa</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-dim text-center">Área</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-dim text-right">Vistas</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-dim text-right">Último Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-slate-950/20">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    No se encontraron rutas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => {
                  const info = getPathInfo(route.path);
                  
                  return (
                    <tr key={route.id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {info.label}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground-muted">
                        {route.path}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                          style={{
                            borderColor: `${info.color}40`,
                            backgroundColor: `${info.color}15`,
                            color: info.color
                          }}
                        >
                          {info.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-foreground-muted">
                        {route.visits.toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-foreground-dim">
                        {new Date(route.updatedAt).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-[10px] text-foreground-dim">
            Mostrando {filteredRoutes.length} de {routes.length} rutas registradas.
          </p>
        </div>
      </div>
    </div>
  );
}
