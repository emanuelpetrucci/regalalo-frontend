import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeCa from '@angular/common/locales/ca';
import localeEn from '@angular/common/locales/en';

export function registerAppLocales(): void {
  registerLocaleData(localeEs, 'es');
  registerLocaleData(localeCa, 'ca');
  registerLocaleData(localeEn, 'en');
}
