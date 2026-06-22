import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Verificar que el usuario es administrador
    await requireAdmin();

    // Obtener visitas totales
    const siteMetric = await prisma.siteMetric.findFirst();
    const totalVisits = siteMetric?.visits ?? 0;

    // Obtener visitas por ruta
    const routeMetrics = await prisma.routeMetric.findMany({
      orderBy: {
        visits: 'desc',
      },
    });

    return NextResponse.json({
      totalVisits,
      routes: routeMetrics,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
