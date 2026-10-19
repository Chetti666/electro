import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/panel/', '/api/', '/login', '/signup'],
      },
    ],
    sitemap: 'https://vmelectric.cl/sitemap.xml',
  };
}
