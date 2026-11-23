function toBase64Url(value: object): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** JWT mínimo con claim `exp` para tests (sin verificar firma). */
export function createMockJwt(expSeconds: number): string {
  return `e30.${toBase64Url({ exp: expSeconds })}.sig`;
}
