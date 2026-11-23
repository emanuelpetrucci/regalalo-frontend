import { HttpErrorResponse } from '@angular/common/http';
import { mapCancelItemError } from './cancel-item-error.util';

describe('mapCancelItemError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    expect(mapCancelItemError(new Error('network')).bannerKey).toBe(
      'items.cancel.errors.connection',
    );
  });

  it('returns empty view for 401 (handled by interceptor)', () => {
    expect(mapCancelItemError(new HttpErrorResponse({ status: 401 }))).toEqual({});
  });

  it('maps 403 to forbidden key', () => {
    expect(mapCancelItemError(new HttpErrorResponse({ status: 403 })).bannerKey).toBe(
      'items.cancel.errors.forbidden',
    );
  });

  it('maps 404 to not_found key', () => {
    expect(mapCancelItemError(new HttpErrorResponse({ status: 404 })).bannerKey).toBe(
      'items.cancel.errors.not_found',
    );
  });

  it('maps unknown HTTP status to generic banner key', () => {
    expect(mapCancelItemError(new HttpErrorResponse({ status: 503 })).bannerKey).toBe(
      'items.cancel.errors.generic',
    );
  });
});
