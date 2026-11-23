import { HttpErrorResponse } from '@angular/common/http';

export interface DeliverySessionErrorView {
  errorKey: string;
  backRoute: '/entregas' | '/mis-objetos';
}

export function mapDeliverySessionError(err: unknown): DeliverySessionErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return {
      errorKey: 'delivery.detail.errors.load_failed',
      backRoute: '/entregas',
    };
  }

  if (err.status === 401) {
    return {
      errorKey: 'delivery.detail.errors.load_failed',
      backRoute: '/entregas',
    };
  }

  if (err.status === 403) {
    return {
      errorKey: 'delivery.detail.errors.forbidden',
      backRoute: '/mis-objetos',
    };
  }

  if (err.status === 404 || err.status === 400) {
    return {
      errorKey: 'delivery.detail.errors.not_found',
      backRoute: '/entregas',
    };
  }

  return {
    errorKey: 'delivery.detail.errors.load_failed',
    backRoute: '/entregas',
  };
}

export interface DeliverySessionMutationErrorView {
  errorKey: string;
}

/** Maps POST confirm/cancel errors for in-dialog display (session already loaded). */
export function mapDeliverySessionMutationError(
  err: unknown,
): DeliverySessionMutationErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { errorKey: 'delivery.detail.errors.action_failed' };
  }

  if (err.status === 409) {
    return { errorKey: 'delivery.detail.errors.confirm_conflict' };
  }

  if (err.status === 403) {
    return { errorKey: 'delivery.detail.errors.forbidden' };
  }

  if (err.status === 404) {
    return { errorKey: 'delivery.detail.errors.not_found' };
  }

  return { errorKey: 'delivery.detail.errors.action_failed' };
}

/** Maps POST cancel errors for in-dialog display (session already loaded). */
export function mapDeliverySessionCancelError(
  err: unknown,
): DeliverySessionMutationErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { errorKey: 'delivery.detail.errors.action_failed' };
  }

  if (err.status === 409) {
    return { errorKey: 'delivery.detail.errors.cancel_conflict' };
  }

  if (err.status === 403) {
    return { errorKey: 'delivery.detail.errors.forbidden' };
  }

  if (err.status === 404) {
    return { errorKey: 'delivery.detail.errors.not_found' };
  }

  if (err.status === 400) {
    return { errorKey: 'delivery.detail.errors.cancel_invalid' };
  }

  return { errorKey: 'delivery.detail.errors.action_failed' };
}
