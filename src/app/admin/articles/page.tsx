'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  author: { name: string | null };
  category: { name: string } | null;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    setArticles(articles.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-rajdhani)',
            color: 'var(--foreground)',
            letterSpacing: '1px'
          }}
        >
          Artículos
        </h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: 'var(--primary)',
            border: '1px solid var(--primary)',
            color: '#fff',
          }}
        >
          <Plus className="w-4 h-4" />
          Nuevo artículo
        </Link>
      </div>

      <div
        className="rounded-lg overflow-hidden card"
        style={{ padding: 0 }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Título</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Categoría</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Autor</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Fecha</th>
              <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr
                key={article.id}
                style={{ borderBottom: '1px solid var(--card-border)' }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{article.title}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                    style={{
                      background: article.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: article.status === 'PUBLISHED' ? 'var(--success)' : 'var(--warning)',
                      border: `1px solid ${article.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    }}
                  >
                    {article.status === 'PUBLISHED' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {article.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>{article.category?.name || '—'}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>{article.author.name || article.author.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {new Date(article.createdAt).toLocaleDateString('es-CL')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="p-1.5 rounded transition-all hover:bg-primary/10"
                      style={{ color: 'var(--primary-light)' }}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded transition-all hover:bg-red-400/10"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--foreground-dim)' }}>
                  No hay artículos todavía. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
