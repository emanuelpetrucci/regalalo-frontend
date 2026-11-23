import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookieConsentService } from './cookie-consent.service';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

@Injectable({ providedIn: 'root' })
export class AnalyticsEventsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly consent = inject(CookieConsentService);

  trackSignUp(): void {
    this.send('sign_up', { method: 'email' });
  }

  trackItemPublished(itemId: string | number): void {
    this.send('publicacion_articulo', { item_id: itemId });
  }

  private send(name: string, params: Record<string, unknown>): void {
    if (!isPlatformBrowser(this.platformId) || !this.consent.canRun('analytics')) {
      return;
    }
    const gtag = (window as GtagWindow).gtag;
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
  }
}
