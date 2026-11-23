import { HttpErrorResponse } from '@angular/common/http';

export interface PauseItemErrorView {
  bannerKey?: string;
}

export function mapPauseItemError(err: unknown): PauseItemErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'items.pause.errors.connection' };
  }

  if (err.status === 401) {
    return {};
  }

  if (err.status === 403) {
    return { bannerKey: 'items.pause.errors.forbidden' };
  }

  if (err.status === 404) {
    return { bannerKey: 'items.pause.errors.not_found' };
  }

  if (err.status === 409) {
    return { bannerKey: 'items.pause.errors.not_active' };
  }

  if (err.status === 0) {
    return { bannerKey: 'items.pause.errors.connection' };
  }

  return { bannerKey: 'items.pause.errors.generic' };
}
