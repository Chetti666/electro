import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
    },
  });
  if (!article) {
    return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { title, excerpt, content, imageUrl, status, categoryId, slug: customSlug } = await request.json();

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = customSlug || slugify(title);
      const existing = await prisma.article.findUnique({ where: { slug: data.slug as string } });
      if (existing && existing.id !== Number(id)) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }
    if (excerpt !== undefined) data.excerpt = excerpt || null;
    if (content !== undefined) data.content = content;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (status !== undefined) data.status = status;
    if (categoryId !== undefined) data.categoryId = categoryId ? Number(categoryId) : null;

    const article = await prisma.article.update({
      where: { id: Number(id) },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.article.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
