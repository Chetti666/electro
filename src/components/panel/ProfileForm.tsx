'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export default function ProfileForm({
  initialName,
  initialEmail,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar el perfil.');
      }

      setSuccess('Perfil actualizado correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el perfil.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label htmlFor="profile-name" className="form-label">
          Nombre o empresa
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="profile-email" className="form-label">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          autoComplete="email"
          required
        />
      </div>

      <div
        className="pt-4"
        style={{ borderTop: '1px solid var(--card-border)' }}
      >
        <h2
          className="text-base font-semibold mb-3"
          style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)' }}
        >
          Cambiar contraseña
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--foreground-dim)' }}>
          Deja estos campos vacíos si no quieres cambiar tu contraseña.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="form-label">
              Contraseña actual
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="form-label">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="form-label">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: 'var(--success)',
          }}
        >
          {success}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary">
        {isLoading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
