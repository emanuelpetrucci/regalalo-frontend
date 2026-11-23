import { HttpErrorResponse } from '@angular/common/http';
import { mapProfileUpdateError } from './profile-update-error.util';

describe('mapProfileUpdateError', () => {
  it('maps 400 geocoding to postal field key', () => {
    const result = mapProfileUpdateError(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Error de geocodificación del código postal' },
      }),
    );
    expect(result.fields?.['postalCode']).toBe('profile.settings.error.postal_invalid');
  });

  it('maps 400 validation errors for profile fields', () => {
    const result = mapProfileUpdateError(
      new HttpErrorResponse({
        status: 400,
        error: {
          errors: [
            { path: 'firstName' },
            { path: 'last_name' },
            { path: 'phone' },
            { path: 'avatarUrl' },
            { path: 'preferredLanguage' },
          ],
        },
      }),
    );
    expect(result.fields?.['firstName']).toBe('profile.settings.error.field_invalid');
    expect(result.fields?.['lastName']).toBe('profile.settings.error.field_invalid');
    expect(result.fields?.['phone']).toBe('profile.settings.error.field_invalid');
    expect(result.fields?.['avatarUrl']).toBe('profile.settings.error.field_invalid');
    expect(result.fields?.['preferredLanguage']).toBe('profile.settings.error.field_invalid');
  });

  it('maps non-HTTP error to generic banner key', () => {
    const result = mapProfileUpdateError(new Error('network'));
    expect(result.bannerKey).toBe('profile.settings.error.generic');
  });

  it('maps unknown HTTP status to generic banner key', () => {
    const result = mapProfileUpdateError(new HttpErrorResponse({ status: 503 }));
    expect(result.bannerKey).toBe('profile.settings.error.generic');
  });
});
