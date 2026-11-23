import { HttpErrorResponse } from '@angular/common/http';

export interface SelectReceiverErrorView {
  bannerKey?: string;
}

function conflictMessage(err: HttpErrorResponse): string {
  const body = err.error;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const msg = (body as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }
  if (typeof body === 'string') {
    return body;
  }
  return '';
}

export function mapSelectReceiverError(err: unknown): SelectReceiverErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'items.my_objects.select_errors.generic' };
  }

  if (err.status === 401) {
    return {};
  }

  if (err.status === 400) {
    return { bannerKey: 'items.my_objects.select_errors.validation' };
  }

  if (err.status === 403) {
    return { bannerKey: 'items.my_objects.select_errors.forbidden' };
  }

  if (err.status === 404) {
    return { bannerKey: 'items.my_objects.select_errors.not_found' };
  }

  if (err.status === 409) {
    const msg = conflictMessage(err).toLowerCase();
    if (msg.includes('pending')) {
      return { bannerKey: 'items.my_objects.select_errors.conflict_pending' };
    }
    if (msg.includes('active')) {
      return { bannerKey: 'items.my_objects.select_errors.conflict_active' };
    }
    return { bannerKey: 'items.my_objects.select_errors.conflict_generic' };
  }

  return { bannerKey: 'items.my_objects.select_errors.generic' };
}
