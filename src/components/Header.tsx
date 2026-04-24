'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Calculadoras', href: '/calculadoras' },
    { name: 'Informes', href: '/informes' },
    { name: 'Acerca de', href: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,255,0.1)] py-2'
          : 'bg-black/40 backdrop-blur-sm py-3'
      }`}
      style={{
        borderBottom: scrolled 
          ? '1px solid rgba(0, 255, 255, 0.3)' 
          : '1px solid rgba(0, 255, 255, 0.1)',
        boxShadow: scrolled 
          ? '0 0 20px rgba(0, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 255, 255, 0.1)' 
          : 'none'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-black border border-cyan-400 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]">
              <Zap className="w-5 h-5 text-cyan-400 fill-current animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 animate-ping" />
            </div>
            <span 
              className="text-xl font-bold tracking-wider"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)'
              }}
            >
              VMElectric
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 rounded-md text-sm font-medium transition-all duration-300`}
                  style={{
                    fontFamily: 'var(--font-orbitron)',
                    color: isActive ? '#00ffff' : 'rgba(226, 232, 240, 0.7)',
                    textShadow: isActive ? '0 0 10px rgba(0,255,255,0.8)' : 'none',
                    background: isActive ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 15px rgba(0, 255, 255, 0.2)' : 'none'
                  }}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-md -z-10"
                      style={{
                        background: 'linear-gradient(90deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.05) 100%)',
                        border: '1px solid rgba(0,255,255,0.3)'
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300"
                    style={{
                      background: '#00ffff',
                      boxShadow: '0 0 10px #00ffff',
                      width: isActive ? '60%' : '0%'
                    }}
                  />
                </Link>
              );
            })}
            <div 
              className="w-px h-6 mx-3" 
              style={{ 
                background: 'linear-gradient(180deg, transparent, rgba(0,255,255,0.5), transparent)',
                boxShadow: '0 0 10px rgba(0,255,255,0.3)'
              }}
            />
            <Link
              href="/login"
              className="px-6 py-2 rounded-md text-sm font-medium transition-all duration-300"
              style={{
                fontFamily: 'var(--font-orbitron)',
                background: 'transparent',
                border: '2px solid #ff00ff',
                color: '#ff00ff',
                boxShadow: '0 0 10px rgba(255,0,255,0.3), inset 0 0 10px rgba(255,0,255,0.1)',
                textShadow: '0 0 10px rgba(255,0,255,0.5)'
              }}
            >
              Login
            </Link>
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-300"
            style={{
              color: '#00ffff',
              border: '1px solid rgba(0,255,255,0.3)'
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(3, 7, 18, 0.98)',
              borderTop: '1px solid rgba(0, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 255, 0.1)'
            }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-4 rounded-md text-base font-medium transition-all`}
                    style={{
                      fontFamily: 'var(--font-orbitron)',
                      color: isActive ? '#00ffff' : 'rgba(226, 232, 240, 0.7)',
                      background: isActive ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid transparent',
                      textShadow: isActive ? '0 0 10px rgba(0,255,255,0.5)' : 'none'
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div 
                className="h-px my-3" 
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.3), transparent)',
                  boxShadow: '0 0 10px rgba(0,255,255,0.2)'
                }}
              />
              <Link
                href="/login"
                className="px-4 py-4 rounded-md text-center font-medium transition-all"
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  background: 'transparent',
                  border: '2px solid #ff00ff',
                  color: '#ff00ff',
                  boxShadow: '0 0 15px rgba(255,0,255,0.2)',
                  textShadow: '0 0 10px rgba(255,0,255,0.5)'
                }}
              >
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}