import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

const DISMISSED_KEY = 'rgl_feed_banner_dismissed';

@Component({
  selector: 'app-feed-global-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  template: `
    @if (!dismissed()) {
      <div class="feed-banner" role="note" *transloco="let t">
        <p class="feed-banner__text">
          {{ t('guest.banner.text') }}
          <a routerLink="/register" class="feed-banner__register-cta">
            {{ t('guest.banner.register_cta') }}
          </a>
          {{ t('guest.banner.register_cta_suffix') }}
        </p>
        <button
          type="button"
          class="feed-banner__dismiss"
          [attr.aria-label]="t('guest.banner.dismiss')"
          (click)="dismiss()"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    }
  `,
  styleUrl: './feed-global-banner.component.scss',
})
export class FeedGlobalBannerComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  readonly dismissed = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (sessionStorage.getItem(DISMISSED_KEY)) {
        this.dismissed.set(true);
      }
    }
  }

  dismiss(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    }
    this.dismissed.set(true);
  }
}
