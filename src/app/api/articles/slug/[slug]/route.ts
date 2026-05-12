import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
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
