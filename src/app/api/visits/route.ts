import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const metric = await prisma.siteMetric.findFirst();
  return NextResponse.json({ visits: metric?.visits ?? 0 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (body && typeof body.path === 'string') {
      const path = body.path;
      let cleanPath = path.trim();
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }
      
      const routeMetric = await prisma.routeMetric.upsert({
        where: { path: cleanPath },
        update: { visits: { increment: 1 } },
        create: { path: cleanPath, visits: 1 },
      });
      
      return NextResponse.json({ path: routeMetric.path, visits: routeMetric.visits });
    }
  } catch (error) {
    console.error('Error recording path visit:', error);
  }

  const metric = await prisma.siteMetric.upsert({
    where: { id: 1 },
    update: { visits: { increment: 1 } },
    create: { id: 1, visits: 1 },
  });
  return NextResponse.json({ visits: metric.visits });
}
