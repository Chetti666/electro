'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Calculadoras', href: '/calculadoras' },
    { name: 'Informes', href: '/informes' },
    { name: 'Acerca de', href: '/about' },
    { name: 'Contacto', href: '/contact' },
  ];

  return (
    <>
      {/* Mobile top bar - thin, just logo */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          background: scrolled ? 'rgba(11, 17, 33, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--card-border)' : '1px solid transparent',
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        <div className="flex items-center justify-between h-11 px-4">
          <Link href="/" className="flex items-center gap-2 active:opacity-70 transition-opacity min-h-11">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: 'var(--foreground)',
                letterSpacing: '0.5px'
              }}
            >
              VMElectric
            </span>
          </Link>
        </div>
      </header>

      {/* Desktop header */}
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-nav-bg/95 backdrop-blur-xl shadow-lg py-2'
            : 'bg-transparent py-3'
        }`}
        style={{
          borderBottom: scrolled ? '1px solid var(--header-border)' : '1px solid transparent'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20"
              >
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  color: 'var(--foreground)',
                  letterSpacing: '1px'
                }}
              >
                VMElectric
              </span>
            </Link>

            <nav className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                    style={{
                      color: isActive ? 'var(--primary-light)' : 'var(--foreground-muted)',
                      background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    }}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 rounded-lg -z-10"
                        style={{
                          background: 'rgba(37, 99, 235, 0.1)',
                          border: '1px solid rgba(37, 99, 235, 0.2)'
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
              <div
                className="w-px h-6 mx-2"
                style={{ background: 'var(--card-border)' }}
              />
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  color: '#fff',
                }}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
