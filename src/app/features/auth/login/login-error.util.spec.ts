import { HttpErrorResponse } from '@angular/common/http';
import { mapLoginError } from './login-error.util';

describe('mapLoginError', () => {
  it('maps 401 to invalid-credentials banner key', () => {
    const result = mapLoginError(new HttpErrorResponse({ status: 401 }));
    expect(result.bannerKey).toBe('auth.login.error.401');
  });

  it('maps 422 to recaptcha banner key', () => {
    const result = mapLoginError(new HttpErrorResponse({ status: 422 }));
    expect(result.bannerKey).toBe('auth.login.error.422');
  });

  it('maps non-HTTP error to connection banner key', () => {
    const result = mapLoginError(new Error('network'));
    expect(result.bannerKey).toBe('auth.login.error.connection');
  });

  it('maps HTTP status 0 to connection banner key', () => {
    const result = mapLoginError(new HttpErrorResponse({ status: 0 }));
    expect(result.bannerKey).toBe('auth.login.error.connection');
  });

  it('maps unknown HTTP status to generic banner key', () => {
    const result = mapLoginError(new HttpErrorResponse({ status: 503 }));
    expect(result.bannerKey).toBe('auth.login.error.generic');
  });

  it('maps 500 to generic banner key', () => {
    const result = mapLoginError(new HttpErrorResponse({ status: 500 }));
    expect(result.bannerKey).toBe('auth.login.error.generic');
  });
});
