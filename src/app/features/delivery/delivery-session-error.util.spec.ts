import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import {
  mapDeliverySessionCancelError,
  mapDeliverySessionError,
  mapDeliverySessionMutationError,
} from './delivery-session-error.util';

describe('mapDeliverySessionError', () => {
  it('maps 403 to forbidden with mis-objetos back', () => {
    const view = mapDeliverySessionError(new HttpErrorResponse({ status: 403 }));
    expect(view.errorKey).toBe('delivery.detail.errors.forbidden');
    expect(view.backRoute).toBe('/mis-objetos');
  });

  it('maps 404 to not_found', () => {
    const view = mapDeliverySessionError(new HttpErrorResponse({ status: 404 }));
    expect(view.errorKey).toBe('delivery.detail.errors.not_found');
    expect(view.backRoute).toBe('/entregas');
  });

  it('maps unknown errors to generic', () => {
    const view = mapDeliverySessionError(new Error('network'));
    expect(view.errorKey).toBe('delivery.detail.errors.load_failed');
  });
});

describe('mapDeliverySessionMutationError', () => {
  it('maps 409 to confirm_conflict', () => {
    const view = mapDeliverySessionMutationError(
      new HttpErrorResponse({ status: 409 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.confirm_conflict');
  });

  it('maps 403 to forbidden', () => {
    const view = mapDeliverySessionMutationError(
      new HttpErrorResponse({ status: 403 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.forbidden');
  });

  it('maps 404 to not_found', () => {
    const view = mapDeliverySessionMutationError(
      new HttpErrorResponse({ status: 404 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.not_found');
  });

  it('maps unknown errors to action_failed', () => {
    const view = mapDeliverySessionMutationError(new Error('network'));
    expect(view.errorKey).toBe('delivery.detail.errors.action_failed');
  });
});

describe('mapDeliverySessionCancelError', () => {
  it('maps 409 to cancel_conflict', () => {
    const view = mapDeliverySessionCancelError(
      new HttpErrorResponse({ status: 409 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.cancel_conflict');
  });

  it('maps 403 to forbidden', () => {
    const view = mapDeliverySessionCancelError(
      new HttpErrorResponse({ status: 403 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.forbidden');
  });

  it('maps 404 to not_found', () => {
    const view = mapDeliverySessionCancelError(
      new HttpErrorResponse({ status: 404 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.not_found');
  });

  it('maps 400 to cancel_invalid', () => {
    const view = mapDeliverySessionCancelError(
      new HttpErrorResponse({ status: 400 }),
    );
    expect(view.errorKey).toBe('delivery.detail.errors.cancel_invalid');
  });

  it('maps unknown errors to action_failed', () => {
    const view = mapDeliverySessionCancelError(new Error('network'));
    expect(view.errorKey).toBe('delivery.detail.errors.action_failed');
  });
});
