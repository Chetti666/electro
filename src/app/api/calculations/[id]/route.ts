import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const calculationId = Number(id);

    if (!Number.isInteger(calculationId) || calculationId <= 0) {
      return NextResponse.json(
        { error: 'Cálculo inválido' },
        { status: 400 }
      );
    }

    const result = await prisma.calculation.deleteMany({
      where: { id: calculationId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Cálculo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error deleting calculation:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cálculo' },
      { status: 500 }
    );
  }
}
