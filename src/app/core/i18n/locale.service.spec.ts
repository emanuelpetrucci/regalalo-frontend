import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { LocaleService } from './locale.service';

const esJson = { common: { language: { es: 'Español', ca: 'Català', en: 'English' } } };

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';

    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, ca: {}, en: {} },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
    });

    service = TestBed.inject(LocaleService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initialises to es when navigator language is unsupported (e.g. de)', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    service.init();
    expect(service.getActive()).toBe('es');
  });

  it('reads saved locale from localStorage on init', () => {
    localStorage.setItem('rgl_locale', 'en');
    service.init();
    expect(service.getActive()).toBe('en');
  });

  it('reads saved ca locale from localStorage on init', () => {
    localStorage.setItem('rgl_locale', 'ca');
    service.init();
    expect(service.getActive()).toBe('ca');
  });

  it('ignores unsupported locale in localStorage and falls back to navigator', () => {
    localStorage.setItem('rgl_locale', 'fr');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    service.init();
    expect(service.getActive()).toBe('es');
  });

  it('detects ca locale from navigator when no storage', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ca-ES');
    service.init();
    expect(service.getActive()).toBe('ca');
  });

  it('detects en locale from navigator when no storage', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    service.init();
    expect(service.getActive()).toBe('en');
  });

  it('persists locale to localStorage on setLocale', () => {
    service.setLocale('ca');
    expect(localStorage.getItem('rgl_locale')).toBe('ca');
  });

  it('updates document.documentElement.lang on setLocale', () => {
    service.setLocale('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('initFromPath resolves locale from path segment /en/', () => {
    service.initFromPath('/en/something');
    expect(service.getActive()).toBe('en');
  });

  it('initFromPath resolves locale from path segment /ca', () => {
    service.initFromPath('/ca');
    expect(service.getActive()).toBe('ca');
  });

  it('initFromPath falls back to es for unknown path segment', () => {
    service.initFromPath('/unknown');
    expect(service.getActive()).toBe('es');
  });
});
