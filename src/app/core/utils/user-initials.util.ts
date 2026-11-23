/**
 * Iniciales derivadas de un UUID de usuario (fallback cuando el DTO no trae nombre).
 *
 * @deprecated Solo uso interno de `UserAvatarComponent`. No importar desde features.
 */
export function initialsFromUserId(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 2).toUpperCase();
}
