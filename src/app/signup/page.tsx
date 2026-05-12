'use client';

import { useState, FormEvent, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type EditingUser = User & {
  password?: string;
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch {
      console.error('No se pudo cargar la lista de usuarios.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!password) {
      setError('La contraseña es obligatoria.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(`¡Usuario creado con éxito! Email: ${data.email}`);
      resetForm();
      fetchUsers();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      if (!response.ok) throw new Error('Failed to update user');
      setSuccess('¡Usuario actualizado con éxito!');
      fetchUsers();
      setIsModalOpen(false);
    } catch {
      setError('Error al actualizar el usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setSuccess(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        setSuccess('Usuario eliminado con éxito.');
        fetchUsers();
      } catch {
        setError('Error al eliminar el usuario. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
  };

return (
    <div className="container mx-auto px-4 py-8" style={{ minHeight: '100vh' }}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <div className="w-full p-8 space-y-6 card">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)', letterSpacing: '1px' }}>Crear Usuario</h1>
              <p style={{ color: 'var(--foreground-dim)' }}>Ingresa los datos para registrar un nuevo usuario.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="form-label">Nombre (Opcional)</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del usuario"
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--success)' }}>
                  <p>{success}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="p-8 card">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)', letterSpacing: '1px' }}>Usuarios Registrados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <th className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Nombre</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Email</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Rol</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Fecha</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{user.name || <span style={{ color: 'var(--foreground-dim)' }}>N/A</span>}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="badge"
                          style={{
                            background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                            border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                            color: user.role === 'ADMIN' ? 'var(--danger)' : 'var(--primary-light)',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground-dim)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleEdit(user)} className="text-sm font-medium" style={{ color: 'var(--primary-light)' }}>Editar</button>
                        <button onClick={() => handleDelete(user.id)} className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)' }}>
          <div className="p-8 rounded-xl shadow-xl w-full max-w-md card">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)', letterSpacing: '1px' }}>Editar Usuario</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="form-label">Nombre</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="form-label">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="edit-password" className="form-label">Nueva Contraseña</label>
                <input
                  id="edit-password"
                  type="password"
                  placeholder="(Dejar en blanco para no cambiar)"
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="edit-role" className="form-label">Rol</label>
                <select
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="form-select"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
