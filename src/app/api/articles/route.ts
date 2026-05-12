import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const categorySlug = searchParams.get('category');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const { title, excerpt, content, imageUrl, status, categoryId } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        imageUrl: imageUrl || null,
        status: status || 'DRAFT',
        authorId: user.id,
        categoryId: categoryId ? Number(categoryId) : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
