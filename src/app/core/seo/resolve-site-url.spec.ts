import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { absoluteSiteUrl, resolveSiteBaseUrl } from './resolve-site-url';
import { SITE_BASE_URL } from './site-base-url.token';

describe('absoluteSiteUrl', () => {
  it('builds root and nested paths', () => {
    expect(absoluteSiteUrl('/', 'https://regalalo.org')).toBe('https://regalalo.org/');
    expect(absoluteSiteUrl('/ca', 'https://regalalo.org')).toBe('https://regalalo.org/ca');
  });
});

describe('resolveSiteBaseUrl', () => {
  it('uses SITE_BASE_URL when provided', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SITE_BASE_URL, useValue: 'https://staging.example.com' }],
    });
    expect(TestBed.runInInjectionContext(() => resolveSiteBaseUrl())).toBe(
      'https://staging.example.com',
    );
  });

  it('falls back to environment.siteUrl', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.runInInjectionContext(() => resolveSiteBaseUrl())).toBe(
      environment.siteUrl.replace(/\/$/, ''),
    );
  });
});
