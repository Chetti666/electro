'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, User, MessageSquare, AlertCircle, CheckCircle, Zap } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  type: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    type: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.type) {
      newErrors.type = 'Selecciona un tipo de consulta';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setStatusMessage('¡Mensaje enviado exitosamente! Te responderemos pronto.');
        setFormData({ name: '', email: '', type: '', message: '' });
      } else {
        setSubmitStatus('error');
        setStatusMessage(data.error || 'Error al enviar el mensaje');
      }
    } catch {
      setSubmitStatus('error');
      setStatusMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg transition-all duration-300 outline-none
    bg-black/40 border backdrop-blur-sm
    ${hasError
      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'border-cyan-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.3)]'
    }
    text-gray-100 placeholder-gray-500
  `;

  return (
    <section className="pt-24 pb-12 md:pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}>
            <Zap className="w-8 h-8" style={{ color: '#00ffff' }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-orbitron)', color: '#fff' }}>
            Contacto
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(226,232,240,0.7)' }}>
            ¿Tienes consultas o sugerencias sobre nuestras herramientas? Estamos aquí para ayudarte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl p-8 md:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,20,0.9) 0%, rgba(26,26,46,0.9) 100%)',
              border: '1px solid rgba(0,255,255,0.2)',
              boxShadow: '0 0 40px rgba(0,255,255,0.1), 0 25px 50px rgba(0,0,0,0.5)'
            }}
          >
            {submitStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  submitStatus === 'success' ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-red-900/30 border border-red-500/30'
                }`}
              >
                {submitStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={submitStatus === 'success' ? 'text-emerald-300' : 'text-red-300'}>
                  {statusMessage}
                </span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#00ffff' }}>
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className={`${inputStyles(!!errors.name)} pl-12`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#00ffff' }}>
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className={`${inputStyles(!!errors.email)} pl-12`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#00ffff' }}>
                  Tipo de Consulta
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`${inputStyles(!!errors.type)} pl-12 appearance-none cursor-pointer`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="consulta">Consulta</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="reporte_bug">Reporte de Error</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-400">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: '#00ffff' }}>
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe tu consulta o sugerencia..."
                  className={`${inputStyles(!!errors.message)} resize-none`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'var(--font-orbitron)',
                  background: isSubmitting
                    ? 'rgba(255,0,255,0.3)'
                    : 'linear-gradient(135deg, #ff00ff 0%, #ff44aa 100%)',
                  boxShadow: '0 0 20px rgba(255,0,255,0.4)',
                  border: '1px solid rgba(255,0,255,0.5)'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center"
        >
          {[
            { icon: Mail, title: 'Email', desc: 'contacto@electrocalc.com', color: 'cyan' },
            { icon: Zap, title: 'Respuesta', desc: 'En menos de 48h', color: 'magenta' },
            { icon: MessageSquare, title: 'Soporte', desc: 'Para consultas técnicas', color: 'amber' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-xl"
              style={{
                background: 'rgba(10,10,20,0.6)',
                border: `1px solid rgba(${item.color === 'cyan' ? '0,255,255' : item.color === 'magenta' ? '255,0,255' : '251,191,36'},0.2)`
              }}>
              <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: item.color === 'cyan' ? '#00ffff' : item.color === 'magenta' ? '#ff00ff' : '#fbbf24' }} />
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <p style={{ color: 'rgba(226,232,240,0.6)' }}>{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}