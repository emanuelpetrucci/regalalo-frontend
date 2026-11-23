import { HttpErrorResponse } from '@angular/common/http';
import { mapRegisterError } from './register-error.util';

describe('mapRegisterError', () => {
  it('maps 409 to banner key with login link', () => {
    const result = mapRegisterError(new HttpErrorResponse({ status: 409 }));
    expect(result.bannerKey).toBe('auth.register.error.409');
    expect(result.showLoginLink).toBe(true);
  });

  it('maps 422 to recaptcha banner key', () => {
    const result = mapRegisterError(new HttpErrorResponse({ status: 422 }));
    expect(result.bannerKey).toBe('auth.register.error.422');
  });

  it('maps 400 geocoding to postal field key', () => {
    const result = mapRegisterError(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Error de geocodificación del código postal' },
      }),
    );
    expect(result.fields?.['postalCode']).toBe('auth.register.error.postal_invalid');
  });

  it('maps 400 validation errors for firstName, lastName and phone', () => {
    const result = mapRegisterError(
      new HttpErrorResponse({
        status: 400,
        error: {
          errors: [
            { path: 'firstName' },
            { path: 'last_name' },
            { path: 'phone' },
          ],
        },
      }),
    );
    expect(result.fields?.['firstName']).toBe('auth.register.error.field_invalid');
    expect(result.fields?.['lastName']).toBe('auth.register.error.field_invalid');
    expect(result.fields?.['phone']).toBe('auth.register.error.field_invalid');
  });

  it('maps non-HTTP error to connection banner key', () => {
    const result = mapRegisterError(new Error('network'));
    expect(result.bannerKey).toBe('auth.register.error.connection');
  });

  it('maps unknown HTTP status to generic banner key', () => {
    const result = mapRegisterError(new HttpErrorResponse({ status: 503 }));
    expect(result.bannerKey).toBe('auth.register.error.generic');
  });
});
