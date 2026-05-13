import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User, FolderOpen, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
  });

  if (!article) return { title: 'Artículo no encontrado - VMElectric' };

  return {
    title: `${article.title} - VMElectric`,
    description: article.excerpt || article.title,
    openGraph: article.imageUrl ? { images: [article.imageUrl] } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { id: true, name: true } },
      category: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <section className="pt-24 pb-12 md:pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm transition-colors mb-8"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>

        <article>
          {article.imageUrl && (
            <div className="rounded-xl overflow-hidden mb-8 h-64 sm:h-80 relative">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-5 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {article.category && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium"
                style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  color: 'var(--primary-light)',
                }}
              >
                <FolderOpen className="w-3 h-3" />
                {article.category.name}
              </span>
            )}
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

          <h1
            className="text-2xl sm:text-3xl font-bold mb-6 leading-tight tracking-tight"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-rajdhani)',
              letterSpacing: '0.5px',
            }}
          >
            {article.title}
          </h1>

          {article.excerpt && (
            <p
              className="text-base mb-8 italic leading-relaxed pl-4"
              style={{
                color: 'var(--foreground-muted)',
                borderLeft: '2px solid rgba(37, 99, 235, 0.3)',
              }}
            >
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content leading-relaxed"
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '1.05rem',
              lineHeight: '1.9',
              color: 'var(--foreground)',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <div
          className="mt-12 pt-8 text-center"
          style={{ borderTop: '1px solid var(--card-border)' }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-rajdhani)',
              letterSpacing: '0.5px',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Más artículos
          </Link>
        </div>
      </div>
    </section>
  );
}
