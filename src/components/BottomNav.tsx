'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Calculator, FileText, User, Newspaper } from 'lucide-react';

const navItems = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Blog', href: '/blog', icon: Newspaper },
  { label: 'Calculadoras', href: '/calculadoras', icon: Calculator },
  { label: 'Informes', href: '/informes', icon: FileText },
  { label: 'Perfil', href: '/about', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(11, 17, 33, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--card-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-full active:scale-95 transition-transform duration-150"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-2 rounded-xl -z-10"
                  style={{
                    background: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon
                className="h-5 w-5 mb-0.5 transition-colors duration-200"
                style={{
                  color: active ? 'var(--primary-light)' : 'var(--foreground-dim)',
                }}
              />
              <span
                className="text-[10px] font-semibold leading-tight text-center truncate w-full px-1 transition-colors duration-200"
                style={{
                  color: active ? 'var(--primary-light)' : 'var(--foreground-dim)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
