/** UUID v4 (mismo criterio que el backend para lookup por id). */
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isItemUuidV4(segment: string): boolean {
  return UUID_V4.test(segment);
}

export interface ItemPublicRef {
  slug?: string | null;
  id?: string | null;
}

export function itemPublicPathSegment(item: ItemPublicRef): string {
  const slug = item.slug?.trim() ?? '';
  if (slug) {
    return slug;
  }
  return item.id?.trim() ?? '';
}

export function itemPublicUrl(siteBase: string, item: ItemPublicRef): string {
  const segment = itemPublicPathSegment(item);
  if (!segment) {
    return '';
  }
  const base = siteBase.replace(/\/$/, '');
  return `${base}/items/${segment}`;
}
