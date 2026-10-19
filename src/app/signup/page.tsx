'use client';

import { useEffect, useState, FormEvent, SVGProps } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => {
        if (user) {
          router.replace(user.role === 'ADMIN' ? '/admin' : '/panel');
        }
      })
      .catch(() => {
        // Sin sesión activa: se muestra el formulario.
      });
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos para crear tu cuenta.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear la cuenta.');
      }

      router.push('/panel');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-24"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-md p-8 space-y-6"
        style={{
          background: 'var(--card-bg)',
          borderRadius: '1rem',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <LogoIcon className="h-8 w-8 text-primary-light" />
          <h1
            className="text-2xl font-bold text-center"
            style={{
              fontFamily: 'var(--font-rajdhani)',
              color: 'var(--foreground)',
              letterSpacing: '1px',
            }}
          >
            Crear cuenta
          </h1>
        </div>

        <p
          className="text-center text-sm"
          style={{ color: 'var(--foreground-dim)' }}
        >
          Crea tu cuenta de cliente para guardar cálculos e informes en tu panel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o empresa"
              className="form-input"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="form-input"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute flex items-center px-4"
              style={{ right: 0, top: '1.5rem', color: 'var(--foreground-dim)' }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <label
            htmlFor="acceptTerms"
            className="flex items-start gap-2 text-sm"
            style={{ color: 'var(--foreground-dim)' }}
          >
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
              style={{ accentColor: 'var(--primary)' }}
            />
            <span>
              Acepto los términos de uso y el tratamiento de mis datos para
              guardar mis cálculos e informes.
            </span>
          </label>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
              }}
            >
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              background: 'var(--primary)',
              border: '1px solid var(--primary)',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p
          className="text-center text-sm"
          style={{ color: 'var(--foreground-dim)' }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--primary-light)' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
