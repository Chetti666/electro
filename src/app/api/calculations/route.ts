import { NextResponse } from 'next/server';
import { CalculationType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { isCalculationType } from '@/lib/calculation-types';

const MAX_CALCULATION_BYTES = 64 * 1024;

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export async function GET() {
  try {
    const user = await requireUser();

    const calculations = await prisma.calculation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(calculations);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error fetching calculations:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const type = typeof body.type === 'string' ? body.type : '';
    if (!isCalculationType(type)) {
      return NextResponse.json(
        { error: 'Tipo de cálculo inválido' },
        { status: 400 }
      );
    }

    if (!body.input || !body.result) {
      return NextResponse.json(
        { error: 'Los datos del cálculo son requeridos' },
        { status: 400 }
      );
    }

    const serialized = JSON.stringify({ input: body.input, result: body.result });
    if (Buffer.byteLength(serialized, 'utf8') > MAX_CALCULATION_BYTES) {
      return NextResponse.json(
        { error: 'El cálculo excede el tamaño máximo permitido' },
        { status: 413 }
      );
    }

    const title =
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 150)
        : null;

    const calculation = await prisma.calculation.create({
      data: {
        userId: user.id,
        type: type as CalculationType,
        title,
        input: body.input as Prisma.InputJsonValue,
        result: body.result as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error creating calculation:', error);
    return NextResponse.json(
      { error: 'Error al guardar el cálculo' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();

    const result = await prisma.calculation.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error clearing calculations:', error);
    return NextResponse.json(
      { error: 'Error al vaciar el historial' },
      { status: 500 }
    );
  }
}
