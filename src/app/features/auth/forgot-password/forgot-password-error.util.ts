import { HttpErrorResponse } from '@angular/common/http';

export interface ForgotPasswordErrorView {
  bannerKey: string;
}

export function mapForgotPasswordError(err: unknown): ForgotPasswordErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'auth.forgot.error.connection' };
  }
  if (err.status === 0) {
    return { bannerKey: 'auth.forgot.error.connection' };
  }
  if (err.status === 400) {
    return { bannerKey: 'auth.forgot.error.validation' };
  }
  if (err.status === 429) {
    return { bannerKey: 'auth.forgot.error.generic' };
  }
  return { bannerKey: 'auth.forgot.error.generic' };
}
