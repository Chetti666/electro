import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Sirve la portada de un artículo publicado como una imagen real.
 * Evita que el base64 guardado en `Article.imageUrl` termine en el HTML.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId, status: 'PUBLISHED' },
    select: { imageUrl: true },
  });

  if (!article?.imageUrl) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (/^https?:\/\//i.test(article.imageUrl)) {
    return NextResponse.redirect(article.imageUrl, 307);
  }

  const match = article.imageUrl.match(DATA_URL_PATTERN);
  if (!match) {
    return new NextResponse('Unsupported image', { status: 415 });
  }

  const bytes = Buffer.from(match[2], 'base64');

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
