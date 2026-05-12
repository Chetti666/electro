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

  return (
    <section className="pt-24 pb-12 md:pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
            style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
            <Zap className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Contacto
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            ¿Tienes consultas o sugerencias sobre nuestras herramientas? Estamos aquí para ayudarte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl p-8 md:p-10 card"
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
                <label className="form-label">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-dim)' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="form-input pl-12"
                    style={errors.name ? { borderColor: 'var(--danger)' } : {}}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{errors.name}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-dim)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="form-input pl-12"
                    style={errors.email ? { borderColor: 'var(--danger)' } : {}}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{errors.email}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Tipo de Consulta
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--foreground-dim)' }} />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input pl-12 appearance-none cursor-pointer"
                    style={{ ...(errors.type ? { borderColor: 'var(--danger)' } : {}) }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="consulta">Consulta</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="reporte_bug">Reporte de Error</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{errors.type}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe tu consulta o sugerencia..."
                  className="form-input resize-none"
                  style={errors.message ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.message && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting ? 'var(--primary-dark)' : 'var(--primary)',
                  border: '1px solid var(--primary)',
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
            { icon: Mail, title: 'Email', desc: 'contacto@electrocalc.com' },
            { icon: Zap, title: 'Respuesta', desc: 'En menos de 48h' },
            { icon: MessageSquare, title: 'Soporte', desc: 'Para consultas técnicas' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-xl card">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-primary-light" />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
              <p style={{ color: 'var(--foreground-dim)' }}>{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
