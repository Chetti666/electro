import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog - VMElectric',
  description: 'Artículos, noticias e información relevante sobre instalaciones eléctricas',
};

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { id: true, name: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <section className="pt-24 pb-12 md:pt-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1
            className="section-title"
          >
            Blog Técnico
          </h1>
          <p className="section-subtitle">
            Artículos, guías y noticias sobre instalaciones eléctricas, normativas vigentes y mejores prácticas del sector.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => (
              <span
                key={cat.id}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  color: 'var(--primary-light)',
                }}
              >
                {cat.name} ({cat._count.articles})
              </span>
            ))}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--foreground-muted)' }}>
              No hay artículos publicados todavía. Vuelve pronto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group card"
              >
                {article.imageUrl && (
                  <div className="-mx-6 -mt-6 mb-5 overflow-hidden rounded-t-xl relative bg-black/20" style={{ aspectRatio: '16/9' }}>
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                )}
                {article.category && (
                  <span
                    className="inline-block px-2.5 py-0.5 rounded text-xs font-medium mb-3"
                    style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      color: 'var(--primary-light)',
                    }}
                  >
                    {article.category.name}
                  </span>
                )}
                <h2
                  className="text-lg font-bold mb-2 leading-snug transition-colors group-hover:text-primary-light"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-rajdhani)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p
                    className="text-sm mb-4 line-clamp-3 leading-relaxed"
                    style={{ color: 'var(--foreground-dim)' }}
                  >
                    {article.excerpt}
                  </p>
                )}
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(article.createdAt).toLocaleDateString('es-CL', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                  {article.author.name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {article.author.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
