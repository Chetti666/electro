const SITE_URL = 'https://www.vmelectric.cl';

/**
 * Las portadas de artículos se guardan como data URLs base64 en la base de
 * datos. Imprimirlas directamente en el HTML infla cada página varios MB
 * (el mismo base64 se repite en <img>, Open Graph, JSON-LD y el payload RSC),
 * lo que perjudica el rastreo. Estas utilidades las cambian por una URL
 * pública y cacheable.
 */
const PROXYABLE_DATA_URL = /^data:(image\/(?:png|jpe?g|webp|gif));base64,/i;

export interface ArticleImageSource {
  id: number;
  imageUrl?: string | null;
  updatedAt?: Date | string | null;
}

export function isProxyableArticleImage(value: string): boolean {
  return PROXYABLE_DATA_URL.test(value);
}

/** URL relativa para <img>/next/image: proxy interno o URL externa tal cual. */
export function getArticleImageSrc(
  article: ArticleImageSource
): string | null {
  if (!article.imageUrl) return null;
  if (!isProxyableArticleImage(article.imageUrl)) return article.imageUrl;

  const version = article.updatedAt
    ? new Date(article.updatedAt).getTime()
    : null;

  return version
    ? `/api/articles/${article.id}/image?v=${version}`
    : `/api/articles/${article.id}/image`;
}

/** URL absoluta para canonical, Open Graph y JSON-LD. */
export function getAbsoluteArticleImageSrc(
  article: ArticleImageSource
): string | null {
  const src = getArticleImageSrc(article);
  if (!src) return null;
  return /^https?:\/\//i.test(src) ? src : `${SITE_URL}${src}`;
}
