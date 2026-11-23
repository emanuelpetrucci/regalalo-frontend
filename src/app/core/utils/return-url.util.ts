/** Valida returnUrl interno seguro (ruta relativa, sin protocolo ni //). */
export function sanitizeReturnUrl(returnUrl: string | null | undefined): string | null {
  if (!returnUrl) {
    return null;
  }
  const trimmed = returnUrl.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  if (/^\/[a-z][a-z0-9+\-.]*:/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}
