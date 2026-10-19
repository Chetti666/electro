'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, FileText, User } from 'lucide-react';

export default function PanelSidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/panel',
      label: 'Resumen',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      active: pathname === '/panel',
    },
    {
      href: '/panel/historial',
      label: 'Historial de cálculos',
      icon: <History className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/panel/historial'),
    },
    {
      href: '/panel/informes',
      label: 'Informes guardados',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/panel/informes'),
    },
    {
      href: '/panel/perfil',
      label: 'Mi perfil',
      icon: <User className="w-4 h-4 shrink-0" />,
      active: pathname.startsWith('/panel/perfil'),
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
