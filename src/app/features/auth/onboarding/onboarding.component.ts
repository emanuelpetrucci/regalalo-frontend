import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  isOnboardingDone,
  markOnboardingDone,
} from '../../../core/constants/onboarding';
import { sanitizeReturnUrl } from '../../../core/utils/return-url.util';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

const SLIDE_COUNT = 5;

/** Chrome claro/oscuro por slide (como SLIDES_META en Onboarding.html). */
const SLIDE_CHROME_DARK = [true, false, true, false, true] as const;

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, LanguageSelectorComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  host: {
    class: 'onboarding-host',
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class OnboardingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  readonly slideCount = SLIDE_COUNT;
  readonly index = signal(0);
  readonly direction = signal(1);
  readonly slideKey = signal(0);

  readonly isDarkChrome = computed(() => SLIDE_CHROME_DARK[this.index()] ?? false);
  readonly isFirst = computed(() => this.index() === 0);
  readonly isLast = computed(() => this.index() === SLIDE_COUNT - 1);
  readonly showSkip = computed(() => this.index() < SLIDE_COUNT - 1);
  readonly showBottomNext = computed(() => this.index() < SLIDE_COUNT - 1);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (isOnboardingDone()) {
      void this.redirectAfterOnboarding();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.go(1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.go(-1);
    }
  }

  go(delta: number): void {
    const next = Math.max(0, Math.min(SLIDE_COUNT - 1, this.index() + delta));
    if (next === this.index()) {
      return;
    }
    this.direction.set(delta >= 0 ? 1 : -1);
    this.slideKey.update((k) => k + 1);
    this.index.set(next);
  }

  finish(): void {
    markOnboardingDone();
    void this.redirectAfterOnboarding();
  }

  private async redirectAfterOnboarding(): Promise<void> {
    const returnUrl = sanitizeReturnUrl(
      this.route.snapshot.queryParamMap.get('returnUrl'),
    );
    await this.router.navigateByUrl(returnUrl ?? '/explorar');
  }
}
