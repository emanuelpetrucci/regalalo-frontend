import { HttpErrorResponse } from '@angular/common/http';

export interface CancelItemErrorView {
  bannerKey?: string;
}

export function mapCancelItemError(err: unknown): CancelItemErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'items.cancel.errors.connection' };
  }

  if (err.status === 401) {
    return {};
  }

  if (err.status === 403) {
    return { bannerKey: 'items.cancel.errors.forbidden' };
  }

  if (err.status === 404) {
    return { bannerKey: 'items.cancel.errors.not_found' };
  }

  return { bannerKey: 'items.cancel.errors.generic' };
}
