'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Heart, Mail, MapPin, Phone } from "lucide-react";

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
    <footer className="relative mt-20 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/30 transition-all duration-300">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                ElectroCalc
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Tu compañero digital en el terreno. Simplificamos cálculos complejos y generamos informes profesionales para el sector eléctrico.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Navegación
              <span className="h-1 w-8 bg-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Contacto
              <span className="h-1 w-8 bg-emerald-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <span>contacto@electrocalc.cl</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <span>+56 9 4038 1316</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-500"
        >
          <p>&copy; {currentYear} ElectroCalc. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> por el equipo de ElectroCalc
          </p>
        </motion.div>
      </div>
    </footer>
  );
}