import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfiguration } from '../api/generated/api-configuration';
import { SessionService } from '../services/session.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const config = inject(ApiConfiguration);

  if (!session.isAuthenticated()) {
    return next(req);
  }

  const token = session.getToken();
  if (!token) {
    return next(req);
  }

  // Solo enviamos el token a las peticiones que van a nuestra API para evitar fugas a dominios externos o assets.
  const isApiRequest = req.url.startsWith(config.rootUrl);
  if (!isApiRequest) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
