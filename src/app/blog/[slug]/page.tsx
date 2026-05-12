import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User, FolderOpen, ArrowLeft } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al blog
      </Link>

      <article>
        {article.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-8 h-64 sm:h-80">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
          {article.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight tracking-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base text-muted-foreground mb-8 italic leading-relaxed border-l-2 border-primary/30 pl-4">
            {article.excerpt}
          </p>
        )}

        <div
          className="article-content"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '1.05rem',
            lineHeight: '1.9',
            color: '#e2e8f0',
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      <div className="mt-12 pt-8 border-t border-border text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-card-hover transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Más artículos
        </Link>
      </div>
    </div>
  );
}
