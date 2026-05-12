'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { articles: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');

  const loadCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  };

  useEffect(loadCategories, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      setNewName('');
      loadCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) loadCategories();
  };

  return (
    <div>
      <h1
        className="text-2xl mb-6 font-bold"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          color: 'var(--foreground)',
          letterSpacing: '1px'
        }}
      >
        Categorías
      </h1>

      <form
        onSubmit={handleCreate}
        className="flex gap-3 mb-6"
      >
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="form-input flex-1"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'var(--primary)',
            border: '1px solid var(--primary)',
            color: '#fff',
          }}
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </form>

      <div
        className="rounded-lg overflow-hidden card"
        style={{ padding: 0 }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Slug</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Artículos</th>
              <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr
                key={cat.id}
                style={{ borderBottom: '1px solid var(--card-border)' }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{cat.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>{cat.slug}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>{cat._count.articles}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded transition-all hover:bg-red-400/10"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--foreground-dim)' }}>
                  No hay categorías. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
