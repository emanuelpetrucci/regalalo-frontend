import { HttpErrorResponse } from '@angular/common/http';
import { mapSelectReceiverError } from './select-receiver-error.util';

describe('mapSelectReceiverError', () => {
  it('returns empty view for 401 (handled by interceptor)', () => {
    expect(mapSelectReceiverError(new HttpErrorResponse({ status: 401 }))).toEqual(
      {},
    );
  });

  it('maps 400 to validation key', () => {
    expect(
      mapSelectReceiverError(new HttpErrorResponse({ status: 400 })).bannerKey,
    ).toBe('items.my_objects.select_errors.validation');
  });

  it('maps 403 to forbidden key', () => {
    expect(
      mapSelectReceiverError(new HttpErrorResponse({ status: 403 })).bannerKey,
    ).toBe('items.my_objects.select_errors.forbidden');
  });

  it('maps 404 to not_found key', () => {
    expect(
      mapSelectReceiverError(new HttpErrorResponse({ status: 404 })).bannerKey,
    ).toBe('items.my_objects.select_errors.not_found');
  });

  it('maps 409 pending conflict', () => {
    expect(
      mapSelectReceiverError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Request is not in pending state' },
        }),
      ).bannerKey,
    ).toBe('items.my_objects.select_errors.conflict_pending');
  });

  it('maps 409 active conflict', () => {
    expect(
      mapSelectReceiverError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Item is not active' },
        }),
      ).bannerKey,
    ).toBe('items.my_objects.select_errors.conflict_active');
  });

  it('maps unknown 409 to conflict_generic', () => {
    expect(
      mapSelectReceiverError(
        new HttpErrorResponse({ status: 409, error: { message: 'Other' } }),
      ).bannerKey,
    ).toBe('items.my_objects.select_errors.conflict_generic');
  });

  it('maps non-HTTP error to generic key', () => {
    expect(mapSelectReceiverError(new Error('network')).bannerKey).toBe(
      'items.my_objects.select_errors.generic',
    );
  });
});
