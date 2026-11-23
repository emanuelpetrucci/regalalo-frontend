import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type AppLocale = 'es' | 'ca' | 'en';

const SUPPORTED: AppLocale[] = ['es', 'ca', 'en'];
const STORAGE_KEY = 'rgl_locale';
const DEFAULT_LOCALE: AppLocale = 'es';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _activeLocale = signal<AppLocale>(DEFAULT_LOCALE);

  readonly currentLocale = this._activeLocale.asReadonly();

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  init(): void {
    const locale = this.resolve();
    this._activeLocale.set(locale);
    this.transloco.setActiveLang(locale);
    this.syncDomLang(locale);
  }

  setLocale(locale: AppLocale): void {
    this._activeLocale.set(locale);
    this.transloco.setActiveLang(locale);
    this.syncDomLang(locale);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }

  getActive(): AppLocale {
    return (this.transloco.getActiveLang() as AppLocale) ?? DEFAULT_LOCALE;
  }

  initFromPath(path: string): void {
    const segment = path.split('/').find(Boolean);
    const locale = SUPPORTED.find((l) => l === segment) ?? DEFAULT_LOCALE;
    this._activeLocale.set(locale);
    this.transloco.setActiveLang(locale);
    this.syncDomLang(locale);
  }

  private resolve(): AppLocale {
    if (this.isBrowser) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && this.isSupported(stored)) {
        return stored as AppLocale;
      }

      // For SEO, the root path should always default to Spanish ('es')
      // regardless of browser language, unless a preference was already stored.
      if (window.location.pathname === '/') {
        return DEFAULT_LOCALE;
      }

      return this.fromNavigator();
    }
    return DEFAULT_LOCALE;
  }

  private fromNavigator(): AppLocale {
    const lang = navigator.language?.toLowerCase() ?? '';
    if (lang.startsWith('ca')) return 'ca';
    if (lang.startsWith('en')) return 'en';
    return 'es';
  }

  private isSupported(lang: string): lang is AppLocale {
    return SUPPORTED.includes(lang as AppLocale);
  }

  private syncDomLang(locale: AppLocale): void {
    if (this.isBrowser) {
      document.documentElement.lang = locale;
    }
  }
}
