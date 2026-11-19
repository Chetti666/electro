import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://www.vmelectric.cl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas públicas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculadoras`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calculadoras/seccion`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/caida-tension`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calculadoras/seccion-ric`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/empalmes`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/calculadora-corriente`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/rotuladora`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/informes`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/informes/informe-resistividad`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/informes/presupuesto`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/informes/informe-fotografico`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/informes/informe-inspeccion`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/informes/orden-trabajo`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/donar`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Artículos del blog publicados (dinámico)
  let blogRoutes: MetadataRoute.Sitemap = [];
  let latestArticleUpdate: Date | undefined;
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    latestArticleUpdate = articles[0]?.updatedAt;

    blogRoutes = articles.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Si la BD no está disponible en build, continúa sin artículos
  }

  // El índice del blog solo cambia cuando se publica o edita un artículo.
  if (latestArticleUpdate) {
    const blogRoute = staticRoutes.find(
      (route) => route.url === `${BASE_URL}/blog`
    );
    if (blogRoute) blogRoute.lastModified = latestArticleUpdate;
  }

  return [...staticRoutes, ...blogRoutes];
}
