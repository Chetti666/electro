'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, PlusCircle, Tags, BarChart3 } from 'lucide-react';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      active: pathname === '/admin',
    },
    {
      href: '/admin/articles',
      label: 'Artículos',
      icon: <Newspaper className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/admin/articles') && pathname !== '/admin/articles/new',
    },
    {
      href: '/admin/articles/new',
      label: 'Nuevo artículo',
      icon: <PlusCircle className="w-4 h-4 shrink-0" />,
      active: pathname === '/admin/articles/new',
    },
    {
      href: '/admin/categories',
      label: 'Categorías',
      icon: <Tags className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/admin/categories'),
    },
    {
      href: '/admin/metrics',
      label: 'Tráfico y Métricas',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/admin/metrics'),
    },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-2 rounded text-sm transition-all flex items-center gap-2 hover:bg-slate-800/40"
          style={
            link.active
              ? {
                  color: 'var(--primary-light)',
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                }
              : {
                  color: 'var(--foreground-muted)',
                  border: '1px solid transparent',
                }
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
