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

    // Lógica para crear un nuevo usuario (POST)
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
      fetchUsers(); // Recargar la lista de usuarios

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
    <div className="container mx-auto px-4 py-8 grid-bg" style={{ minHeight: '100vh' }}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Columna del Formulario */}
        <div className="lg:col-span-2">
          <div 
            className="w-full p-8 space-y-6"
            style={{
              background: 'rgba(10, 15, 30, 0.9)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
            }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>Crear Usuario</h1>
              <p style={{ color: 'rgba(226, 232, 240, 0.6)' }}>Ingresa los datos para registrar un nuevo usuario.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Nombre (Opcional)</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del usuario"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Crea una contraseña segura'
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="role" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Rol</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                >
                  <option value="USER" style={{ background: '#0a0f1a' }}>Usuario</option>
                  <option value="ADMIN" style={{ background: '#0a0f1a' }}>Administrador</option>
                </select>
              </div>
              
              {error && (
                <div className="p-3 rounded-md text-sm" style={{ background: 'rgba(255, 0, 64, 0.1)', border: '1px solid rgba(255, 0, 64, 0.3)', color: '#ff0040' }}>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-md text-sm" style={{ background: 'rgba(0, 255, 80, 0.1)', border: '1px solid rgba(0, 255, 80, 0.3)', color: '#00ff50' }}>
                  <p>{success}</p>
                </div>
              )}

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
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna de la Lista de Usuarios */}
        <div className="lg:col-span-3">
          <div 
            className="p-8"
            style={{
              background: 'rgba(10, 15, 30, 0.9)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 0, 255, 0.3)',
              boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-orbitron)', color: '#ff00ff', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Usuarios Registrados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'rgba(0, 255, 255, 0.1)' }}>
                    <th className="px-4 py-3" style={{ color: '#00ffff', fontFamily: 'var(--font-orbitron)', fontSize: '0.75rem', letterSpacing: '1px' }}>Nombre</th>
                    <th className="px-4 py-3" style={{ color: '#00ffff', fontFamily: 'var(--font-orbitron)', fontSize: '0.75rem', letterSpacing: '1px' }}>Email</th>
                    <th className="px-4 py-3" style={{ color: '#00ffff', fontFamily: 'var(--font-orbitron)', fontSize: '0.75rem', letterSpacing: '1px' }}>Rol</th>
                    <th className="px-4 py-3" style={{ color: '#00ffff', fontFamily: 'var(--font-orbitron)', fontSize: '0.75rem', letterSpacing: '1px' }}>Fecha</th>
                    <th className="px-4 py-3" style={{ color: '#00ffff', fontFamily: 'var(--font-orbitron)', fontSize: '0.75rem', letterSpacing: '1px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}>
                      <td className="px-4 py-3" style={{ color: '#e2e8f0' }}>{user.name || <span style={{ color: 'rgba(226, 232, 240, 0.4)' }}>N/A</span>}</td>
                      <td className="px-4 py-3" style={{ color: '#e2e8f0' }}>{user.email}</td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            background: user.role === 'ADMIN' ? 'rgba(255, 0, 64, 0.2)' : 'rgba(0, 255, 255, 0.2)',
                            border: `1px solid ${user.role === 'ADMIN' ? 'rgba(255, 0, 64, 0.5)' : 'rgba(0, 255, 255, 0.5)'}`,
                            color: user.role === 'ADMIN' ? '#ff0040' : '#00ffff',
                            fontFamily: 'var(--font-orbitron)',
                            fontSize: '0.65rem'
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleEdit(user)} style={{ color: '#00ffff', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)', fontSize: '0.75rem' }}>Editar</button>
                        <button onClick={() => handleDelete(user.id)} style={{ color: '#ff0040', textShadow: '0 0 5px rgba(255, 0, 64, 0.5)', fontSize: '0.75rem' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

{/* Modal de Edición */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)' }}>
          <div 
            className="p-8 rounded-lg shadow-xl w-full max-w-md"
            style={{
              background: 'rgba(10, 15, 30, 0.98)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 50px rgba(0, 255, 255, 0.3)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>Editar Usuario</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="edit-name" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Nombre</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="edit-email" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="edit-password" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Nueva Contraseña</label>
                <input
                  id="edit-password"
                  type="password"
                  placeholder="(Dejar en blanco para no cambiar)"
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="edit-role" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Rol</label>
                <select
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'USER' | 'ADMIN' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                    outline: 'none'
                  }}
                >
                  <option value="USER" style={{ background: '#0a0f1a' }}>Usuario</option>
                  <option value="ADMIN" style={{ background: '#0a0f1a' }}>Administrador</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-md text-sm" style={{ background: 'rgba(255, 0, 64, 0.1)', border: '1px solid rgba(255, 0, 64, 0.3)', color: '#ff0040' }}>
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(226, 232, 240, 0.3)',
                    color: 'rgba(226, 232, 240, 0.7)'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    fontWeight: 600,
                    borderRadius: '0.5rem',
                    background: 'transparent',
                    border: '2px solid #00ffff',
                    color: '#00ffff',
                    fontFamily: 'var(--font-orbitron)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1
                  }}
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
