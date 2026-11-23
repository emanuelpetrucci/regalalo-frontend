import { HttpErrorResponse } from '@angular/common/http';
import { mapRequestItemError } from './request-item-error.util';

describe('mapRequestItemError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    expect(mapRequestItemError(new Error('network')).bannerKey).toBe(
      'items.request.errors.connection',
    );
  });

  it('returns empty view for 401 (handled by interceptor)', () => {
    expect(mapRequestItemError(new HttpErrorResponse({ status: 401 }))).toEqual({});
  });

  it('maps 400 to own_item key', () => {
    expect(mapRequestItemError(new HttpErrorResponse({ status: 400 })).bannerKey).toBe(
      'items.request.errors.own_item',
    );
  });

  it('maps 409 paused message to paused key', () => {
    expect(
      mapRequestItemError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Requests are paused for this item' },
        }),
      ).bannerKey,
    ).toBe('items.request.errors.paused');
  });

  it('maps 409 limit message to limit_reached key', () => {
    expect(
      mapRequestItemError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Request limit reached' },
        }),
      ).bannerKey,
    ).toBe('items.request.errors.limit_reached');
  });

  it('maps 409 duplicate message to duplicate with markDone', () => {
    expect(
      mapRequestItemError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Already requested this item' },
        }),
      ),
    ).toEqual({
      bannerKey: 'items.request.errors.duplicate',
      markDone: true,
    });
  });

  it('maps unknown 409 to generic key', () => {
    expect(
      mapRequestItemError(
        new HttpErrorResponse({ status: 409, error: { message: 'other' } }),
      ).bannerKey,
    ).toBe('items.request.errors.generic');
  });

  it('does not treat partial limit substring as limit_reached', () => {
    expect(
      mapRequestItemError(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Rate limit exceeded' },
        }),
      ).bannerKey,
    ).toBe('items.request.errors.generic');
  });

  it('maps 5xx to generic banner key', () => {
    expect(mapRequestItemError(new HttpErrorResponse({ status: 503 })).bannerKey).toBe(
      'items.request.errors.generic',
    );
  });
});
