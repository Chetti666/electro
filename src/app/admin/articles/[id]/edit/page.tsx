'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { slugify } from '@/lib/slugify';

interface Category {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  categoryId: number | null;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewSlug, setPreviewSlug] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);

    fetch(`/api/articles/${params.id}`)
      .then(res => res.json())
      .then((article: Article) => {
        setTitle(article.title);
        setExcerpt(article.excerpt || '');
        setContent(article.content);
        setImageUrl(article.imageUrl || '');
        setStatus(article.status);
        setCategoryId(article.categoryId ? String(article.categoryId) : '');
        setCustomSlug(article.slug);
        setPreviewSlug(article.slug);
        setLoading(false);
      })
      .catch(console.error);
  }, [params.id]);

  useEffect(() => {
    if (customSlug) {
      setPreviewSlug(customSlug);
    } else {
      setPreviewSlug(slugify(title));
    }
  }, [title, customSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          imageUrl: imageUrl || null,
          status,
          categoryId: categoryId || null,
          slug: customSlug || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
        return;
      }

      router.push('/admin/articles');
    } catch {
      alert('Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12" style={{ color: 'var(--foreground-dim)' }}>Cargando...</div>;
  }

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
        Editar Artículo
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label">Título *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Slug (URL)</label>
          <div className="flex gap-2 items-center">
            <input
              value={customSlug}
              onChange={e => setCustomSlug(e.target.value)}
              placeholder={previewSlug}
              className="form-input flex-1"
            />
            <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
              /blog/{previewSlug}
            </span>
          </div>
        </div>

        <div>
          <label className="form-label">Extracto / Resumen</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={3}
            className="form-input resize-none"
          />
        </div>

        <div>
          <label className="form-label">URL de imagen de portada</label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="form-input"
          />
          {imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden w-48 h-32">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="form-label">Categoría</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">Sin categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
              className="form-select"
            >
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Contenido *</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Escribe el contenido del artículo aquí..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !title || !content}
            className="btn btn-primary"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
