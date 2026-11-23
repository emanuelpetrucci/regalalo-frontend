import { HttpErrorResponse } from '@angular/common/http';
import { mapResetPasswordError } from './reset-password-error.util';

describe('mapResetPasswordError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    const result = mapResetPasswordError(new Error('network'));
    expect(result.invalidToken).toBe(false);
    expect(result.bannerKey).toBe('auth.reset.error.connection');
  });

  it('maps HTTP status 0 to connection banner key', () => {
    const result = mapResetPasswordError(new HttpErrorResponse({ status: 0 }));
    expect(result.invalidToken).toBe(false);
    expect(result.bannerKey).toBe('auth.reset.error.connection');
  });

  it('maps 400 to invalid token', () => {
    const result = mapResetPasswordError(new HttpErrorResponse({ status: 400 }));
    expect(result.invalidToken).toBe(true);
    expect(result.bannerKey).toBeUndefined();
  });

  it('maps 500 to generic banner key', () => {
    const result = mapResetPasswordError(new HttpErrorResponse({ status: 500 }));
    expect(result.invalidToken).toBe(false);
    expect(result.bannerKey).toBe('auth.reset.error.generic');
  });
});
