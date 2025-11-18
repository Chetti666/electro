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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Columna del Formulario */}
        <div className="lg:col-span-2">
          <div className="w-full p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Usuario</h1>
              <p className="text-gray-600 dark:text-gray-400">Ingresa los datos para registrar un nuevo usuario.</p>
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
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              placeholder='Crea una contraseña segura'
                  className="form-input"
              required
                />
              </div>
              <div>
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md text-sm">
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md text-sm">
                  <p>{success}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna de la Lista de Usuarios */}
        <div className="lg:col-span-3">
          <div className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Usuarios Registrados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Rol</th>
                    <th className="px-4 py-2">Fecha Creación</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">{user.name || <span className="text-gray-500">N/A</span>}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handleEdit(user)} className="text-blue-500 hover:underline text-xs">Editar</button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Editar Usuario</h2>
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
                  className="form-input"
                  required
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
                  className="form-input"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md text-sm">
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
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
