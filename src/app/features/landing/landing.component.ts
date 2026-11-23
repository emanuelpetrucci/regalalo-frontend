import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AppLocale, LocaleService } from '../../core/i18n/locale.service';
import { LandingSeoService } from '../../core/seo/landing-seo.service';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';
import { LandingNavComponent } from '../../shared/components/landing-nav/landing-nav.component';
import { scrollToHowItWorksSection } from '../../shared/landing/scroll-to-how-it-works';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'landing-page',
    '[class.landing-motion-ready]': 'motionReady()',
  },
  imports: [RouterLink, TranslocoModule, LandingNavComponent, LandingFooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly locale = inject(LocaleService);
  private readonly transloco = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly landingSeo = inject(LandingSeoService);
  private readonly cookieConsent = inject(CookieConsentService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly motionReady = signal(false);
  readonly openFaqItems = signal<Set<number>>(new Set());

  toggleFaq(idx: number): void {
    this.openFaqItems.update(s => {
      const n = new Set(s);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  }

  readonly faqKeys = [
    { q: 'landing.seo.faq.q1', a: 'landing.seo.faq.a1' },
    { q: 'landing.seo.faq.q2', a: 'landing.seo.faq.a2' },
    { q: 'landing.seo.faq.q3', a: 'landing.seo.faq.a3' },
    { q: 'landing.seo.faq.q4', a: 'landing.seo.faq.a4' },
    { q: 'landing.seo.faq.q5', a: 'landing.seo.faq.a5' },
    { q: 'landing.seo.faq.q6', a: 'landing.seo.faq.a6' },
    { q: 'landing.seo.faq.q7', a: 'landing.seo.faq.a7' },
    { q: 'landing.seo.faq.q8', a: 'landing.seo.faq.a8' },
  ] as const;

  private revealObserver: IntersectionObserver | null = null;
  private revealScrollRaf = 0;

  constructor() {
    effect(
      () => {
        const canRunAnalytics = this.cookieConsent.snapshot().categories.analytics;
        if (canRunAnalytics) {
          this.landingSeo.initAnalyticsIfNeeded();
        }
      },
    );

    afterNextRender(() => {
      this.setupScrollListener();
      this.startLandingMotion();
    });

    this.destroyRef.onDestroy(() => this.revealObserver?.disconnect());
  }

  ngOnInit(): void {
    const routeLocale = this.route.snapshot.data['locale'] as AppLocale | undefined;
    if (routeLocale) {
      this.locale.setLocale(routeLocale);
    }

    this.landingSeo.initAnalyticsIfNeeded();

    this.transloco.selectTranslation(this.locale.getActive())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.landingSeo.apply(this.locale.getActive());
        if (this.motionReady()) {
          queueMicrotask(() => this.refreshScrollReveal());
        } else if (isPlatformBrowser(this.platformId)) {
          // afterNextRender fired before *transloco rendered the hero content;
          // retry now that translations are loaded and the DOM is populated.
          setTimeout(() => this.startLandingMotion());
        }
      });
  }

  scrollToHowItWorks(event: Event): void {
    event.preventDefault();
    scrollToHowItWorksSection(this.document, this.router);
  }

  private setupScrollListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const win = this.document.defaultView;
    if (!win) return;
    const onScroll = (): void => {
      if (!this.motionReady()) {
        return;
      }
      if (this.revealScrollRaf) {
        return;
      }
      this.revealScrollRaf = win.requestAnimationFrame(() => {
        this.revealScrollRaf = 0;
        this.revealVisibleElementsInViewport();
      });
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', onScroll);
      if (this.revealScrollRaf) {
        win.cancelAnimationFrame(this.revealScrollRaf);
      }
    });
  }

  private startLandingMotion(): void {
    if (this.motionReady() || !isPlatformBrowser(this.platformId)) return;

    const root = this.host.nativeElement;
    const heroCopy = root.querySelector<HTMLElement>('.hero-copy');

    // Guard: *transloco may not have rendered the template yet (CSR without SSR
    // transfer-state). The transloco subscription will retry via setTimeout.
    if (!heroCopy) return;

    const reducedMotion = this.document.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches ?? false;

    root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      if (reducedMotion || this.isElementInViewport(el)) {
        el.classList.add('visible');
      }
    });

    if (!reducedMotion) {
      heroCopy.classList.add('hero-motion--run');
      root.querySelector('.hero-visual')?.classList.add('hero-motion--run');
    }

    this.motionReady.set(true);
    this.setupScrollReveal();
    this.revealVisibleElementsInViewport();
    this.setupStatsCounter();
  }

  private refreshScrollReveal(): void {
    this.revealVisibleElementsInViewport();
    this.setupScrollReveal();
  }

  private revealVisibleElementsInViewport(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.host.nativeElement
      .querySelectorAll<HTMLElement>('.reveal:not(.visible)')
      .forEach((el) => {
        if (this.isElementInViewport(el)) {
          const delay = parseInt(el.dataset['delay'] ?? '0', 10);
          setTimeout(() => el.classList.add('visible'), delay);
          this.revealObserver?.unobserve(el);
        }
      });
  }

  private isElementInViewport(el: HTMLElement): boolean {
    const win = this.document.defaultView;
    if (!win) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.top < win.innerHeight * 0.88 && rect.bottom > 0;
  }

  private setupScrollReveal(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.revealObserver?.disconnect();

    const elements = this.host.nativeElement.querySelectorAll<HTMLElement>(
      '.reveal:not(.visible)',
    );
    if (!elements.length) {
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset['delay'] ?? '0', 10);
            setTimeout(() => el.classList.add('visible'), delay);
            this.revealObserver?.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );

    elements.forEach((el) => this.revealObserver?.observe(el));
  }

  private setupStatsCounter(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const statsStrip = this.document.getElementById('stats-strip');
    if (!statsStrip) return;
    let animated = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          animated = true;
          this.animateCount('stat-objects', 2400, '+', 1400);
          this.animateCount('stat-cities', 18, '', 900);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(statsStrip);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private animateCount(id: string, target: number, suffix: string, duration: number): void {
    const el = this.document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(ease * target).toLocaleString('es') + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

}
