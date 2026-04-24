"use client";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useState, SVGProps, FormEvent } from "react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);
    if (response.ok) {
      router.push('/signup');
    } else {
      const data = await response.json();
      setError(data.error || 'Ocurrió un error al iniciar sesión.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen grid-bg">
      <div 
        className="w-full max-w-md p-8 space-y-6"
        style={{
          background: 'rgba(10, 15, 30, 0.9)',
          borderRadius: '1rem',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.03)'
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <LogoIcon className="h-8 w-8" style={{ color: '#00ffff', filter: 'drop-shadow(0 0 10px #00ffff)' }} />
          <h1 
            className="text-2xl font-bold text-center"
            style={{ fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
          >
            Login
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginTop: '0.5rem',
                background: 'rgba(10, 15, 30, 0.8)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                outline: 'none'
              }}
            />
          </div>
          <div className="relative">
            <Label htmlFor="password">Contraseña</Label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginTop: '0.5rem',
                background: 'rgba(10, 15, 30, 0.8)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              className="absolute inset-y-0 flex items-center px-4"
              style={{ right: 0, top: '1.5rem', color: 'rgba(0, 255, 255, 0.6)' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {error && (
            <div 
              className="p-3 rounded-md text-sm"
              style={{
                background: 'rgba(255, 0, 64, 0.1)',
                border: '1px solid rgba(255, 0, 64, 0.3)',
                color: '#ff0040'
              }}
            >
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                style={{
                  width: '1rem',
                  height: '1rem',
                  accentColor: '#00ffff'
                }}
              />
              <Label
                htmlFor="remember-me"
                style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'rgba(226, 232, 240, 0.7)', fontFamily: 'var(--font-rajdhani)' }}
              >
                Recordar credenciales
              </Label>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                background: 'transparent',
                border: '2px solid #00ffff',
                color: '#00ffff',
                fontFamily: 'var(--font-orbitron)',
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
          <p>
            ¿Problemas para ingresar?{' '}
            <Link href="/contacto" style={{ color: '#ff00ff', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Contáctanos</Link>
          </p>
        </div>

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