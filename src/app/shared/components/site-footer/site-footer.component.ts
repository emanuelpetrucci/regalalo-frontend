import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';

type PlatformSection = 'explorar' | 'mis-objetos' | 'entregas' | 'reputacion' | 'perfil' | null;
type LegalSection = 'privacy' | 'cookies' | null;

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent {
  private readonly cookieConsent = inject(CookieConsentService);

  readonly currentPlatform = input<PlatformSection>(null);
  readonly currentLegal = input<LegalSection>(null);

  openCookiePreferences(): void {
    this.cookieConsent.openPreferences();
  }
}
