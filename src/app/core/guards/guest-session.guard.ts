import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Rutas públicas donde no debe persistir datos de autenticación en localStorage
 * (p. ej. landing, login). Excluye flujos que requieren JWT (verificación de email).
 */
export const purgeAuthStorageGuard: CanActivateFn = () => {
  inject(SessionService).clearToken();
  return true;
};
