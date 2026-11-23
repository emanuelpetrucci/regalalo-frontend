import { HttpErrorResponse } from '@angular/common/http';

export interface LoginErrorView {
  bannerKey: string;
}

export function mapLoginError(err: unknown): LoginErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'auth.login.error.connection' };
  }
  if (err.status === 0) return { bannerKey: 'auth.login.error.connection' };
  if (err.status === 401) return { bannerKey: 'auth.login.error.401' };
  if (err.status === 422) return { bannerKey: 'auth.login.error.422' };
  return { bannerKey: 'auth.login.error.generic' };
}
