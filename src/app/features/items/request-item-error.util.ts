import { HttpErrorResponse } from '@angular/common/http';

export interface RequestItemErrorView {
  bannerKey?: string;
  markDone?: boolean;
}

export function mapRequestItemError(err: unknown): RequestItemErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'items.request.errors.connection' };
  }

  if (err.status === 401) {
    return {};
  }

  if (err.status === 400) {
    return { bannerKey: 'items.request.errors.own_item' };
  }

  if (err.status === 409) {
    const msg: string =
      typeof err.error === 'object' && err.error !== null && 'message' in err.error
        ? String((err.error as { message?: string }).message ?? '')
        : '';

    if (msg === 'Already requested this item') {
      return {
        bannerKey: 'items.request.errors.duplicate',
        markDone: true,
      };
    }
    if (msg === 'Request limit reached') {
      return { bannerKey: 'items.request.errors.limit_reached' };
    }
    if (msg === 'Requests are paused for this item') {
      return { bannerKey: 'items.request.errors.paused' };
    }
    return { bannerKey: 'items.request.errors.generic' };
  }

  return { bannerKey: 'items.request.errors.generic' };
}
