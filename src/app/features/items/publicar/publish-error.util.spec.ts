import { HttpErrorResponse } from '@angular/common/http';
import { mapPublishError } from './publish-error.util';

describe('mapPublishError', () => {
  it('maps non-HTTP error to connection banner key', () => {
    expect(mapPublishError(new Error('network')).bannerKey).toBe(
      'items.publish.errors.connection',
    );
  });

  it('returns empty view for 401 (handled by interceptor)', () => {
    expect(mapPublishError(new HttpErrorResponse({ status: 401 }))).toEqual({});
  });

  it('maps record errors to field i18n keys', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { title: ['Too short'] } },
      }),
    );
    expect(result.fields?.['title']).toBe('items.publish.errors.field_title');
  });

  it('maps array errors to field i18n keys', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 422,
        error: { errors: [{ path: 'postalCode', message: 'invalid' }] },
      }),
    );
    expect(result.fields?.['postalCode']).toBe(
      'items.publish.errors.field_postal_code',
    );
  });

  it('maps category and weightRange record errors to field i18n keys', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            category: ['Invalid'],
            weightRange: ['Invalid'],
          },
        },
      }),
    );
    expect(result.fields?.['category']).toBe('items.publish.errors.field_category');
    expect(result.fields?.['weightRange']).toBe(
      'items.publish.errors.field_weight_range',
    );
  });

  it('maps weightrange path alias to weightRange field', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 400,
        error: { errors: [{ path: 'weightrange', message: 'invalid' }] },
      }),
    );
    expect(result.fields?.['weightRange']).toBe(
      'items.publish.errors.field_weight_range',
    );
  });

  it('maps nested images path to images field', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { 'images[0]': ['invalid format'] } },
      }),
    );
    expect(result.fields?.['images']).toBe('items.publish.errors.field_images');
  });

  it('maps geocoding message to postal field', () => {
    const result = mapPublishError(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Error de geocodificación del código postal' },
      }),
    );
    expect(result.fields?.['postalCode']).toBe(
      'items.publish.errors.field_postal_code',
    );
  });

  it('maps unknown HTTP status to generic banner key', () => {
    expect(mapPublishError(new HttpErrorResponse({ status: 503 })).bannerKey).toBe(
      'items.publish.errors.generic',
    );
  });
});
