import { NextResponse } from 'next/server';
import { Prisma, ReportType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { isReportType } from '@/lib/report-types';

function maxReportBytes(): number {
  const configured = Number(process.env.MAX_REPORT_DATA_MB ?? 8);
  const megabytes = Number.isFinite(configured) && configured > 0 ? configured : 8;
  return megabytes * 1024 * 1024;
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export async function GET() {
  try {
    const user = await requireUser();

    const reports = await prisma.savedReport.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        type: true,
        title: true,
        clientName: true,
        reference: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Error al obtener los informes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const type = typeof body.type === 'string' ? body.type : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!isReportType(type)) {
      return NextResponse.json(
        { error: 'Tipo de informe inválido' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'El título del informe es requerido' },
        { status: 400 }
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

    const report = await prisma.savedReport.create({
      data: {
        userId: user.id,
        type: type as ReportType,
        title: title.slice(0, 200),
        clientName:
          typeof body.clientName === 'string' && body.clientName.trim()
            ? body.clientName.trim().slice(0, 200)
            : null,
        reference:
          typeof body.reference === 'string' && body.reference.trim()
            ? body.reference.trim().slice(0, 200)
            : null,
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

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Error al guardar el informe' },
      { status: 500 }
    );
  }
}
