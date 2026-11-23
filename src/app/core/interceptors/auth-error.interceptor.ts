import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import type { EmailNotVerifiedError } from '../api/generated/models/email-not-verified-error';
import { SessionService } from '../services/session.service';
import { sanitizeReturnUrl } from '../utils/return-url.util';

const RELOGIN_RETURN_KEY = 'rgl_relogin_return';

const AUTH_API_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

function requestPathname(url: string): string {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url.split('?')[0] ?? url;
  }
}

function isPublicAuthRequest(url: string): boolean {
  const pathname = requestPathname(url);
  return AUTH_API_PATHS.some((path) => pathname === path || pathname.endsWith(path));
}

function isEmailNotVerified403(error: HttpErrorResponse): boolean {
  if (error.status !== 403) return false;
  const body = error.error;
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    (body as EmailNotVerifiedError).code === 'EMAIL_NOT_VERIFIED'
  );
}

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (isEmailNotVerified403(error)) {
        const user = session.getUser();
        if (user) {
          session.setUser({ ...user, emailVerified: false });
        }
        if (!router.url.startsWith('/verificacion-pendiente')) {
          void router.navigate(['/verificacion-pendiente']);
        }
        return throwError(() => error);
      }

      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isPublicAuthRequest(req.url)) {
        return throwError(() => error);
      }

      if (!session.getToken()) {
        return throwError(() => error);
      }

      session.clearToken();

      if (router.url.startsWith('/login')) {
        return throwError(() => error);
      }

      let returnUrl = router.url;
      if (isPlatformBrowser(platformId)) {
        const stored = sessionStorage.getItem(RELOGIN_RETURN_KEY);
        if (stored) {
          sessionStorage.removeItem(RELOGIN_RETURN_KEY);
          const sanitized = sanitizeReturnUrl(stored);
          if (sanitized) {
            returnUrl = sanitized;
          }
        }
      }

      void router.navigate(['/login'], {
        queryParams: { returnUrl },
      });

      return throwError(() => error);
    }),
  );
};
