import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

function maxReportBytes(): number {
  const configured = Number(process.env.MAX_REPORT_DATA_MB ?? 8);
  const megabytes = Number.isFinite(configured) && configured > 0 ? configured : 8;
  return megabytes * 1024 * 1024;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const reportId = Number(id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return NextResponse.json(
        { error: 'Informe inválido' },
        { status: 400 }
      );
    }

    const report = await prisma.savedReport.findFirst({
      where: { id: reportId, userId: user.id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Informe no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Error al obtener el informe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const reportId = Number(id);
    const body = await request.json();

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return NextResponse.json(
        { error: 'Informe inválido' },
        { status: 400 }
      );
    }

    const existing = await prisma.savedReport.findFirst({
      where: { id: reportId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Informe no encontrado' },
        { status: 404 }
      );
    }

    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json(
        { error: 'Los datos del informe son requeridos' },
        { status: 400 }
      );
    }

    const size = Buffer.byteLength(JSON.stringify(body.data), 'utf8');
    if (size > maxReportBytes()) {
      return NextResponse.json(
        {
          error: `El informe excede el tamaño máximo permitido (${Math.round(
            maxReportBytes() / (1024 * 1024)
          )} MB). Reduce la cantidad o el tamaño de las imágenes.`,
        },
        { status: 413 }
      );
    }

    const updated = await prisma.savedReport.update({
      where: { id: reportId },
      data: {
        title:
          typeof body.title === 'string' && body.title.trim()
            ? body.title.trim().slice(0, 200)
            : existing.title,
        clientName:
          typeof body.clientName === 'string'
            ? body.clientName.trim().slice(0, 200) || null
            : existing.clientName,
        reference:
          typeof body.reference === 'string'
            ? body.reference.trim().slice(0, 200) || null
            : existing.reference,
        data: body.data as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        type: true,
        title: true,
        clientName: true,
        reference: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el informe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const reportId = Number(id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return NextResponse.json(
        { error: 'Informe inválido' },
        { status: 400 }
      );
    }

    const result = await prisma.savedReport.deleteMany({
      where: { id: reportId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Informe no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el informe' },
      { status: 500 }
    );
  }
}
