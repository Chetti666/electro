'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Heart, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: "#", label: "Github", color: "#00ffff" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter", color: "#ff00ff" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn", color: "#0080ff" },
  ];

  const footerLinks = [
    { name: "Inicio", href: "/" },
    { name: "Calculadoras", href: "/calculadoras" },
    { name: "Informes", href: "/informes" },
    { name: "Acerca de", href: "/about" },
  ];

  return (
    <footer 
      className="relative mt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.9) 0%, rgba(3, 7, 18, 1) 100%)',
        borderTop: '1px solid rgba(0, 255, 255, 0.2)'
      }}
    >
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
        }}
      />

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
                className="relative w-8 h-8 overflow-hidden rounded-lg bg-black flex items-center justify-center transition-all duration-300"
                style={{
                  border: '1px solid rgba(0, 255, 255, 0.5)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
                }}
              >
                <Zap className="w-4 h-4 text-cyan-400 fill-current" />
              </div>
              <span 
                className="text-xl font-bold tracking-wider"
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                }}
              >
                VMElectric
              </span>
            </Link>
            <p className="leading-relaxed" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
              Tu compañero digital en el terreno. Simplificamos cálculos complejos y generamos informes profesionales para el sector eléctrico.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: social.color,
                    border: `1px solid ${social.color}33`,
                    boxShadow: `0 0 10px ${social.color}22`
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}
            >
              Navegación
              <span 
                className="h-px flex-1 ml-2"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.5), transparent)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                }}
              />
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-all duration-300 flex items-center gap-2 group"
                    style={{ color: 'rgba(226, 232, 240, 0.6)' }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: 'rgba(0, 255, 255, 0.3)',
                        boxShadow: '0 0 5px rgba(0, 255, 255, 0.3)'
                      }}
                    />
                    <span className="group-hover:text-cyan-400" style={{ textShadow: '0 0 5px rgba(0, 255, 255, 0.3)' }}>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#ff00ff',
                textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
              }}
            >
              Contacto
              <span 
                className="h-px flex-1 ml-2"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 0, 255, 0.5), transparent)',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)'
                }}
              />
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
                <Mail className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#00ffff' }} />
                <span>vmelectric2025@gmail.com</span>
              </li>
              <li className="flex items-start gap-3" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
                <MessageCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#ff00ff' }} />
                <div className="flex flex-col">
                  <span>+56 9 4038 1316</span>
                  <span>+56 9 3303 8620</span>
                </div>
              </li>
              <li className="flex items-start gap-3" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#ff0080' }} />
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
          style={{ color: 'rgba(226, 232, 240, 0.4)' }}
        >
          <p>&copy; {currentYear} VMElectric. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con 
            <Heart className="w-4 h-4" style={{ color: '#ff0040', fill: '#ff0040', filter: 'drop-shadow(0 0 5px #ff0040)' }} /> 
            por el equipo de VMElectric
          </p>
        </motion.div>
      </div>
    </footer>
  );
}