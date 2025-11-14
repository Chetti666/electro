'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      setError('No se pudo cargar la lista de usuarios.');
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
      setEmail('');
      setName('');
      setPassword('');
      fetchUsers(); // Recargar la lista de usuarios

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
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
                  placeholder="Crea una contraseña segura"
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
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
