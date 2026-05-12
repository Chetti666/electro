import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    const slug = slugify(name);
    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
