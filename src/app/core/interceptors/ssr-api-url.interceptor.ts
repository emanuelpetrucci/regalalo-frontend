import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BACKEND_API_URL } from '../api/backend-api-url.token';

export const ssrApiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const proxyPrefix = environment.apiUrl;

  if (
    isPlatformServer(platformId) &&
    proxyPrefix.startsWith('/') &&
    req.url.startsWith(proxyPrefix)
  ) {
    const backendBase = inject(BACKEND_API_URL, { optional: true });
    if (!backendBase) return next(req);
    const relPath = req.url.slice(proxyPrefix.length);
    return next(req.clone({ url: `${backendBase}${relPath}` }));
  }

  return next(req);
};
