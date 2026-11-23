import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha-2';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideApiClient } from './core/api/api.providers';
import { environment } from '../environments/environment';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { LocaleService } from './core/i18n/locale.service';
import { registerAppLocales } from './core/i18n/register-locales';
import { SeoService } from './core/seo/seo.service';
import { SITE_BASE_URL } from './core/seo/site-base-url.token';
import { CookieConsentService } from './core/services/cookie-consent.service';

registerAppLocales();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    provideClientHydration(withEventReplay()),
    provideApiClient(),
    provideTransloco({
      config: {
        availableLangs: [
          { id: 'es', label: 'Español' },
          { id: 'ca', label: 'Català' },
          { id: 'en', label: 'English' },
        ],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: SITE_BASE_URL, useValue: environment.siteUrl.replace(/\/$/, '') },
    provideAppInitializer(() => {
      inject(LocaleService).init();
      inject(SeoService).init();
      return inject(CookieConsentService).init();
    }),
    ...(environment.recaptchaSiteKey
      ? [
          importProvidersFrom(RecaptchaV3Module),
          { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
        ]
      : []),
  ],
};
