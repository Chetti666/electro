import { MetadataRoute } from 'next';

/**
 * Rastreadores de IA que alimentan entrenamiento, ingesta o índices de modelos.
 * Se bloquean por completo: el código y los contenidos son propietarios.
 * Nota: no se bloquea Googlebot; Google Search sigue indexando el sitio.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'PerplexityBot',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'FacebookBot',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'YouBot',
  'Timpibot',
  'omgili',
  'omgilibot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/panel/', '/api/', '/login', '/signup'],
      },
    ],
    sitemap: 'https://vmelectric.cl/sitemap.xml',
  };
}
