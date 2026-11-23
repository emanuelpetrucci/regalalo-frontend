import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { isLandingPath } from './seo.constants';

describe('isLandingPath', () => {
  it('identifies landing URLs', () => {
    expect(isLandingPath('/')).toBe(true);
    expect(isLandingPath('/en')).toBe(true);
    expect(isLandingPath('/ca')).toBe(true);
    expect(isLandingPath('/como-funciona/reputacion')).toBe(true);
    expect(isLandingPath('/ca/com-funciona/reputacio')).toBe(true);
    expect(isLandingPath('/en/how-it-works/reputation')).toBe(true);
    expect(isLandingPath('/en?x=1')).toBe(true);
    expect(isLandingPath('/explorar')).toBe(true);
  });

  it('rejects app URLs', () => {
    expect(isLandingPath('/login')).toBe(false);
    expect(isLandingPath('/items/abc')).toBe(false);
  });
});

describe('SeoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('sets robots meta per URL', () => {
    const meta = TestBed.inject(Meta);
    const seo = TestBed.inject(SeoService);
    seo.applyRobotsForUrl('/login');
    expect(meta.getTag('name=robots')?.content).toBe('noindex, nofollow');
    seo.applyRobotsForUrl('/');
    expect(meta.getTag('name=robots')?.content).toBe('index, follow');
  });

  it('injects JSON-LD script', () => {
    const seo = TestBed.inject(SeoService);
    seo.setJsonLd('test', { '@context': 'https://schema.org', '@type': 'Thing' });
    const script = document.head.querySelector('script[data-seo-jsonld="test"]');
    expect(script?.textContent).toContain('Thing');
    seo.removeJsonLd('test');
    expect(document.head.querySelector('script[data-seo-jsonld="test"]')).toBeNull();
  });
});
