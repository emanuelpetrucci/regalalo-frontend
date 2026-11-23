import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AppLocale } from '../../../core/i18n/locale.service';
import { PublicLocaleRouterService } from '../../../core/i18n/public-locale-router.service';
import { scrollToHowItWorksSection } from '../../landing/scroll-to-how-it-works';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-landing-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
  imports: [RouterLink, TranslocoModule, LanguageSelectorComponent],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.scss',
})
export class LandingNavComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navHost = viewChild<ElementRef<HTMLElement>>('navHost');
  private readonly publicLocaleRouter = inject(PublicLocaleRouterService);

  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);

  constructor() {
    afterNextRender(() => this.setupScrollListener());
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.mobileMenuOpen()) {
      return;
    }
    const host = this.navHost()?.nativeElement;
    if (host && !host.contains(event.target as Node)) {
      this.closeMobileMenu();
    }
  }

  onEscapeKey(): void {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  onLocaleSelected(locale: AppLocale): void {
    this.publicLocaleRouter.navigateToLocale(locale);
  }

  scrollToHowItWorks(event: Event): void {
    event.preventDefault();
    this.closeMobileMenu();
    scrollToHowItWorksSection(this.document, this.router);
  }

  private setupScrollListener(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    const onScroll = (): void => {
      this.scrolled.set(win.scrollY > 8);
    };
    onScroll();
    win.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => win.removeEventListener('scroll', onScroll));
  }
}
