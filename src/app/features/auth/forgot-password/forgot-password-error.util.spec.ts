import { HttpErrorResponse } from '@angular/common/http';
import { mapForgotPasswordError } from './forgot-password-error.util';

describe('mapForgotPasswordError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    expect(mapForgotPasswordError(new Error('network')).bannerKey).toBe(
      'auth.forgot.error.connection',
    );
  });

  it('maps HTTP status 0 to connection banner key', () => {
    expect(mapForgotPasswordError(new HttpErrorResponse({ status: 0 })).bannerKey).toBe(
      'auth.forgot.error.connection',
    );
  });

  it('maps 400 to validation banner key', () => {
    expect(mapForgotPasswordError(new HttpErrorResponse({ status: 400 })).bannerKey).toBe(
      'auth.forgot.error.validation',
    );
  });

  it('maps 500 to generic banner key', () => {
    expect(mapForgotPasswordError(new HttpErrorResponse({ status: 500 })).bannerKey).toBe(
      'auth.forgot.error.generic',
    );
  });
});
