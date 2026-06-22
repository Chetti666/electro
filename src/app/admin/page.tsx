import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUserFromCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Newspaper, Tags, FileText, Eye, BarChart3 } from 'lucide-react';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const user = token ? getSessionUserFromCookie(token) : null;

  if (!user || user.role !== 'ADMIN') redirect('/login');

  const articleCount = await prisma.article.count();
  const publishedCount = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  const categoryCount = await prisma.category.count();
  const siteMetric = await prisma.siteMetric.findFirst();
  const visitCount = siteMetric?.visits ?? 0;

  return (
    <div>
      <h1
        className="text-2xl mb-2 font-bold"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          color: 'var(--foreground)',
          letterSpacing: '1px'
        }}
      >
        Panel de Administración
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
        Bienvenido, {user.name || user.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total artículos', value: articleCount, color: 'var(--primary-light)' },
          { label: 'Publicados', value: publishedCount, color: 'var(--success)' },
          { label: 'Categorías', value: categoryCount, color: 'var(--secondary)' },
          { label: 'Visitas totales', value: visitCount, color: 'var(--warning)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg p-5 text-center card"
          >
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: 'var(--font-rajdhani)' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <h2
        className="text-lg mb-4 font-semibold"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          color: 'var(--foreground)',
          letterSpacing: '0.5px'
        }}
      >
        Acciones rápidas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] group card"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
            }}
          >
            <Newspaper className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
              Nuevo Artículo
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
              Escribe y publica un nuevo artículo
            </div>
          </div>
        </Link>

        <Link
          href="/admin/articles"
          className="flex items-center gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] group card"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
            }}
          >
            <FileText className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
              Gestionar Artículos
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
              Editar o eliminar artículos existentes
            </div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] group card"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <Tags className="w-6 h-6" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
              Categorías
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
              Administrar categorías de artículos
            </div>
          </div>
        </Link>

        <Link
          href="/blog"
          className="flex items-center gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] group card"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Eye className="w-6 h-6" style={{ color: 'var(--warning)' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
              Ver Blog
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
              Vista previa del blog público
            </div>
          </div>
        </Link>

        <Link
          href="/admin/metrics"
          className="flex items-center gap-4 rounded-lg p-5 transition-all hover:scale-[1.02] group card"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <BarChart3 className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
              Tráfico y Métricas
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
              Monitorear las visitas por ruta y herramienta en tiempo real
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
