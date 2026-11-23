import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocale, LocaleService } from './locale.service';

export const PUBLIC_PAGE_URLS: Record<'landing' | 'reputation', Record<AppLocale, string>> = {
  landing: { es: '/', ca: '/ca', en: '/en' },
  reputation: {
    es: '/como-funciona/reputacion',
    ca: '/ca/com-funciona/reputacio',
    en: '/en/how-it-works/reputation',
  },
};

@Injectable({ providedIn: 'root' })
export class PublicLocaleRouterService {
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);

  navigateToLocale(locale: AppLocale): void {
    const page = this.detectCurrentPage();
    if (page === null) return;
    void this.router.navigateByUrl(PUBLIC_PAGE_URLS[page][locale]);
  }

  getLocaleUrl(page: 'landing' | 'reputation', locale?: AppLocale): string {
    return PUBLIC_PAGE_URLS[page][locale ?? this.localeService.currentLocale()];
  }

  private detectCurrentPage(): 'landing' | 'reputation' | null {
    const url = this.router.url.split('?')[0].split('#')[0];
    for (const [key, urls] of Object.entries(PUBLIC_PAGE_URLS)) {
      if (Object.values(urls).includes(url)) return key as 'landing' | 'reputation';
    }
    return null;
  }
}
