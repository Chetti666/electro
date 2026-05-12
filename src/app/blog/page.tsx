import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User } from 'lucide-react';

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <div className="text-center mb-10">
        <h1
          className="text-xl sm:text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Blog Técnico
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-lg mx-auto">
          Artículos, guías y noticias sobre instalaciones eléctricas, normativas vigentes y mejores prácticas del sector.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <span
              key={cat.id}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {cat.name} ({cat._count.articles})
            </span>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No hay artículos publicados todavía. Vuelve pronto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group rounded-xl overflow-hidden border border-border bg-card hover:bg-card-hover transition-all duration-200"
            >
              {article.imageUrl && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                {article.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-3">
                    {article.category.name}
                  </span>
                )}
                <h2 className="text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
