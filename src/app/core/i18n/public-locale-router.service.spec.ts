import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Signal } from '@angular/core';
import { AppLocale, LocaleService } from './locale.service';
import { PUBLIC_PAGE_URLS, PublicLocaleRouterService } from './public-locale-router.service';

function makeRouter(url: string): { url: string; navigateByUrl: ReturnType<typeof vi.fn> } {
  return { url, navigateByUrl: vi.fn().mockResolvedValue(true) };
}

function makeLocaleService(locale: AppLocale): Pick<LocaleService, 'currentLocale'> {
  const fn = vi.fn().mockReturnValue(locale) as unknown as Signal<AppLocale>;
  return { currentLocale: fn };
}

describe('PublicLocaleRouterService', () => {
  let navigateSpy: ReturnType<typeof vi.fn>;

  function setup(routerUrl: string, locale: AppLocale = 'es'): PublicLocaleRouterService {
    const mockRouter = makeRouter(routerUrl);
    navigateSpy = mockRouter.navigateByUrl;

    TestBed.configureTestingModule({
      providers: [
        PublicLocaleRouterService,
        { provide: Router, useValue: mockRouter },
        { provide: LocaleService, useValue: makeLocaleService(locale) },
      ],
    });

    return TestBed.inject(PublicLocaleRouterService);
  }

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  // --- navigateToLocale ---

  describe('navigateToLocale — landing', () => {
    it('landing ES → EN navega a /en', () => {
      const svc = setup('/');
      svc.navigateToLocale('en');
      expect(navigateSpy).toHaveBeenCalledWith('/en');
    });

    it('landing EN → CA navega a /ca', () => {
      const svc = setup('/en');
      svc.navigateToLocale('ca');
      expect(navigateSpy).toHaveBeenCalledWith('/ca');
    });

    it('landing CA → ES navega a /', () => {
      const svc = setup('/ca');
      svc.navigateToLocale('es');
      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
  });

  describe('navigateToLocale — reputación', () => {
    it('reputación ES → EN navega a /en/how-it-works/reputation', () => {
      const svc = setup('/como-funciona/reputacion');
      svc.navigateToLocale('en');
      expect(navigateSpy).toHaveBeenCalledWith('/en/how-it-works/reputation');
    });

    it('reputación CA → EN navega a /en/how-it-works/reputation', () => {
      const svc = setup('/ca/com-funciona/reputacio');
      svc.navigateToLocale('en');
      expect(navigateSpy).toHaveBeenCalledWith('/en/how-it-works/reputation');
    });

    it('reputación EN → ES navega a /como-funciona/reputacion', () => {
      const svc = setup('/en/how-it-works/reputation');
      svc.navigateToLocale('es');
      expect(navigateSpy).toHaveBeenCalledWith('/como-funciona/reputacion');
    });
  });

  describe('navigateToLocale — página no-pública', () => {
    it('no navega si la URL actual no es una página pública', () => {
      const svc = setup('/explorar');
      svc.navigateToLocale('en');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('no navega desde rutas de auth', () => {
      const svc = setup('/login');
      svc.navigateToLocale('ca');
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('navigateToLocale — ignora query params y hash', () => {
    it('detecta landing con query params en la URL', () => {
      const svc = setup('/?foo=bar');
      svc.navigateToLocale('en');
      expect(navigateSpy).toHaveBeenCalledWith('/en');
    });

    it('detecta landing con hash en la URL', () => {
      const svc = setup('/#como-funciona');
      svc.navigateToLocale('ca');
      expect(navigateSpy).toHaveBeenCalledWith('/ca');
    });
  });

  // --- getLocaleUrl ---

  describe('getLocaleUrl — con locale explícito', () => {
    it('devuelve URL de reputación en inglés', () => {
      const svc = setup('/');
      expect(svc.getLocaleUrl('reputation', 'en')).toBe('/en/how-it-works/reputation');
    });

    it('devuelve URL de reputación en catalán', () => {
      const svc = setup('/');
      expect(svc.getLocaleUrl('reputation', 'ca')).toBe('/ca/com-funciona/reputacio');
    });

    it('devuelve URL de reputación en español', () => {
      const svc = setup('/');
      expect(svc.getLocaleUrl('reputation', 'es')).toBe('/como-funciona/reputacion');
    });

    it('devuelve URL de landing en inglés', () => {
      const svc = setup('/');
      expect(svc.getLocaleUrl('landing', 'en')).toBe('/en');
    });
  });

  describe('getLocaleUrl — locale desde LocaleService cuando no se pasa', () => {
    it('footer en /en usa locale activo "en"', () => {
      const svc = setup('/en', 'en');
      expect(svc.getLocaleUrl('reputation')).toBe('/en/how-it-works/reputation');
    });

    it('footer en /ca usa locale activo "ca"', () => {
      const svc = setup('/ca', 'ca');
      expect(svc.getLocaleUrl('reputation')).toBe('/ca/com-funciona/reputacio');
    });

    it('footer en / usa locale activo "es"', () => {
      const svc = setup('/', 'es');
      expect(svc.getLocaleUrl('reputation')).toBe('/como-funciona/reputacion');
    });
  });

  // --- mapa PUBLIC_PAGE_URLS ---

  describe('PUBLIC_PAGE_URLS', () => {
    it('contiene todas las páginas y locales esperados', () => {
      expect(PUBLIC_PAGE_URLS.landing).toEqual({ es: '/', ca: '/ca', en: '/en' });
      expect(PUBLIC_PAGE_URLS.reputation).toEqual({
        es: '/como-funciona/reputacion',
        ca: '/ca/com-funciona/reputacio',
        en: '/en/how-it-works/reputation',
      });
    });
  });
});
