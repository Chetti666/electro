'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RichTextEditor from '@/components/RichTextEditor';
import { slugify } from '@/lib/slugify';

interface Category {
  id: number;
  name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewSlug, setPreviewSlug] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

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
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          imageUrl: imageUrl || undefined,
          status,
          categoryId: categoryId || undefined,
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
        Nuevo Artículo
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
          <label className="form-label">Imagen de portada</label>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="form-input flex-1"
              />
              <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>o</span>
              <label className="btn btn-secondary cursor-pointer text-sm py-2 px-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setImageUrl(data.url);
                      } else {
                        alert('Error al subir imagen');
                      }
                    } catch {
                      alert('Error al subir imagen');
                    }
                  }}
                />
                Subir archivo
              </label>
            </div>
            <p className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
              Formatos recomendados: WebP, JPEG, PNG. Tamaño máximo: 2MB
            </p>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden w-48 h-32 relative">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
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
            {saving ? 'Guardando...' : 'Guardar Artículo'}
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
