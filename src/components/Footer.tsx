'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Heart, Mail, MapPin, MessageCircle } from "lucide-react";
import VisitCounter from "./VisitCounter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: "#", label: "Github" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
  ];

  const footerLinks = [
    { name: "Inicio", href: "/" },
    { name: "Calculadoras", href: "/calculadoras" },
    { name: "Informes", href: "/informes" },
    { name: "Acerca de", href: "/about" },
  ];

  return (
    <footer
      className="hidden md:block relative mt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(11, 17, 33, 0.95) 0%, rgba(11, 17, 33, 1) 100%)',
        borderTop: '1px solid var(--card-border)'
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div
                className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
              >
                <Zap className="w-4 h-4 text-primary" />
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
            <p className="leading-relaxed text-sm" style={{ color: 'var(--foreground-dim)' }}>
              Tu compañero digital en el terreno. Simplificamos cálculos complejos y generamos informes profesionales para el sector eléctrico.
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--card-bg)',
                    color: 'var(--foreground-muted)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-base font-semibold mb-5"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: 'var(--foreground)',
                letterSpacing: '1px'
              }}
            >
              Navegación
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-all duration-200 flex items-center gap-2 group text-sm"
                    style={{ color: 'var(--foreground-dim)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                      style={{ background: 'var(--foreground-dim)' }}
                    />
                    <span className="group-hover:text-primary-light">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-base font-semibold mb-5"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: 'var(--foreground)',
                letterSpacing: '1px'
              }}
            >
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--foreground-dim)' }}>
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary-light" />
                <span>vmelectric2025@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--foreground-dim)' }}>
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <div className="flex flex-col">
                  <span>+56 9 4038 1316</span>
                  <span>+56 9 3303 8620</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--foreground-dim)' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
          style={{ borderTop: '1px solid var(--card-border)', color: 'var(--foreground-dim)' }}
        >
          <p>&copy; {currentYear} VMElectric. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <VisitCounter />
            <span className="hidden md:inline" style={{ color: 'var(--foreground-dim)' }}>|</span>
            <p className="flex items-center gap-1">
              Hecho con
              <Heart className="w-4 h-4 text-danger" />
              por el equipo de VMElectric
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
