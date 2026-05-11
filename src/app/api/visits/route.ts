import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const metric = await prisma.siteMetric.findFirst();
  return NextResponse.json({ visits: metric?.visits ?? 0 });
}

export async function POST() {
  const metric = await prisma.siteMetric.upsert({
    where: { id: 1 },
    update: { visits: { increment: 1 } },
    create: { id: 1, visits: 1 },
  });
  return NextResponse.json({ visits: metric.visits });
}
