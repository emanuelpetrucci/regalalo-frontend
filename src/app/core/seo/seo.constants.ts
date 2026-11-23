/** Rutas públicas de la landing (indexables). */
export const LANDING_PATHS = new Set([
  '/',
  '/en',
  '/ca',
  '/como-funciona/reputacion',
  '/ca/com-funciona/reputacio',
  '/en/how-it-works/reputation',
  '/explorar',
]);

export function isLandingPath(url: string): boolean {
  const path = url.split('?')[0]?.split('#')[0] ?? '/';
  if (LANDING_PATHS.has(path)) {
    return true;
  }
  return path.startsWith('/items/') || path.startsWith('/en/items/') || path.startsWith('/ca/items/');
}
