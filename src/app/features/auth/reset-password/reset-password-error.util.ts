import { HttpErrorResponse } from '@angular/common/http';

export interface ResetPasswordErrorView {
  invalidToken: boolean;
  bannerKey?: string;
}

export function mapResetPasswordError(err: unknown): ResetPasswordErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { invalidToken: false, bannerKey: 'auth.reset.error.connection' };
  }
  if (err.status === 0) {
    return { invalidToken: false, bannerKey: 'auth.reset.error.connection' };
  }
  if (err.status === 400) {
    return { invalidToken: true };
  }
  if (err.status === 429) {
    return { invalidToken: false, bannerKey: 'auth.reset.error.generic' };
  }
  return { invalidToken: false, bannerKey: 'auth.reset.error.generic' };
}
