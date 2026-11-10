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
    include: { author: { select: { name: true } } },
  });

  if (!article) return { title: 'Artículo no encontrado - VMElectric' };

  const url = `https://www.vmelectric.cl/blog/${slug}`;
  const plainContent = article.content.replace(/<[^>]*>/g, ' ');
  const description = (article.excerpt || plainContent)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);

  return {
    title: `${article.title} | VMElectric`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: 'VMElectric',
      locale: 'es_CL',
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
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

  // Artículos relacionados: primero los de la misma categoría y luego los más recientes.
  const sameCategory = article.categoryId
    ? await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          categoryId: article.categoryId,
          id: { not: article.id },
        },
        select: { id: true, title: true, slug: true, excerpt: true },
        orderBy: { updatedAt: 'desc' },
        take: 4,
      })
    : [];

  const related =
    sameCategory.length >= 4
      ? sameCategory
      : [
          ...sameCategory,
          ...(await prisma.article.findMany({
            where: {
              status: 'PUBLISHED',
              id: { notIn: [article.id, ...sameCategory.map((item) => item.id)] },
            },
            select: { id: true, title: true, slug: true, excerpt: true },
            orderBy: { updatedAt: 'desc' },
            take: 4 - sameCategory.length,
          })),
        ];

  const articleUrl = `https://www.vmelectric.cl/blog/${slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt ?? undefined,
        image: article.imageUrl ? [article.imageUrl] : undefined,
        datePublished: article.createdAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        inLanguage: 'es',
        articleSection: article.category?.name,
        author: {
          '@type': 'Person',
          name: article.author.name ?? 'VMElectric',
        },
        publisher: {
          '@type': 'Organization',
          name: 'VMElectric',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.vmelectric.cl/icon-512.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://www.vmelectric.cl/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://www.vmelectric.cl/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <section className="pt-24 pb-12 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
            <div className="rounded-xl overflow-hidden mb-8 relative bg-black/20" style={{ aspectRatio: '16/9' }}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
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

          {article.content ? (
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
          ) : (
            <p style={{ color: 'var(--foreground-muted)' }} className="italic">
              Este artículo no tiene contenido publicado.
            </p>
          )}
        </article>

        {related.length > 0 && (
          <section
            className="mt-12 pt-8"
            aria-labelledby="articulos-relacionados"
            style={{ borderTop: '1px solid var(--card-border)' }}
          >
            <h2
              id="articulos-relacionados"
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Artículos relacionados
            </h2>
            <ul className="space-y-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group block rounded-xl p-4 transition-colors"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <span
                      className="block font-semibold leading-snug group-hover:text-primary-light"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {item.title}
                    </span>
                    {item.excerpt && (
                      <span
                        className="mt-1 block text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-dim)' }}
                      >
                        {item.excerpt}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p
              className="mt-4 text-sm"
              style={{ color: 'var(--foreground-muted)' }}
            >
              ¿Necesitas verificar un cálculo? Usa la{' '}
              <Link
                href="/calculadoras/caida-tension"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                calculadora de caída de tensión
              </Link>{' '}
              o la{' '}
              <Link
                href="/calculadoras/empalmes"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                calculadora de empalmes
              </Link>
              .
            </p>
          </section>
        )}

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
