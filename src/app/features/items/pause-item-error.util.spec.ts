import { HttpErrorResponse } from '@angular/common/http';
import { mapPauseItemError } from './pause-item-error.util';

describe('mapPauseItemError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    expect(mapPauseItemError(new Error('network')).bannerKey).toBe(
      'items.pause.errors.connection',
    );
  });

  it('returns empty view for 401 (handled by interceptor)', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 401 }))).toEqual({});
  });

  it('maps 403 to forbidden key', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 403 })).bannerKey).toBe(
      'items.pause.errors.forbidden',
    );
  });

  it('maps 404 to not_found key', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 404 })).bannerKey).toBe(
      'items.pause.errors.not_found',
    );
  });

  it('maps 409 to not_active key', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 409 })).bannerKey).toBe(
      'items.pause.errors.not_active',
    );
  });

  it('maps unknown HTTP status to generic banner key', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 503 })).bannerKey).toBe(
      'items.pause.errors.generic',
    );
  });

  it('maps status 0 (network offline) to connection banner key', () => {
    expect(mapPauseItemError(new HttpErrorResponse({ status: 0 })).bannerKey).toBe(
      'items.pause.errors.connection',
    );
  });
});
