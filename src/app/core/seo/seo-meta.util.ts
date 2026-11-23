/** Open Graph recommended dimensions for social previews. */
export const OG_IMAGE_WIDTH = '1200';
export const OG_IMAGE_HEIGHT = '630';

/** Official X/Twitter handle (see sprint-change-proposal SEO/GEO). */
export const TWITTER_SITE_HANDLE = '@regalalo_org';

const SEO_DESCRIPTION_MAX = 160;

/** Truncate at the last word boundary before maxLength; append ellipsis when shortened. */
export function truncateSeoDescription(text: string, maxLength = SEO_DESCRIPTION_MAX): string {
  const normalized = text.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  const slice = normalized.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

/** Infer image MIME for og:image:type from a CDN or absolute URL. */
export function inferOgImageMimeType(imageUrl: string): string {
  const path = imageUrl.split('?')[0]?.toLowerCase() ?? '';
  if (path.endsWith('.webp')) {
    return 'image/webp';
  }
  if (path.endsWith('.png')) {
    return 'image/png';
  }
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  return 'image/jpeg';
}
