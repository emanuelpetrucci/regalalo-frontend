import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { PublicLocaleRouterService } from '../../../core/i18n/public-locale-router.service';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';
import { scrollToHowItWorksSection } from '../../landing/scroll-to-how-it-works';

@Component({
  selector: 'app-landing-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
})
export class LandingFooterComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly cookieConsent = inject(CookieConsentService);
  private readonly publicLocaleRouter = inject(PublicLocaleRouterService);

  readonly reputationUrl = computed(() => this.publicLocaleRouter.getLocaleUrl('reputation'));

  scrollToHowItWorks(event: Event): void {
    event.preventDefault();
    scrollToHowItWorksSection(this.document, this.router);
  }

  openCookiePreferences(): void {
    this.cookieConsent.openPreferences();
  }
}
