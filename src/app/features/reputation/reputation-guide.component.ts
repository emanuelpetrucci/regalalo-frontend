import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AppLocale, LocaleService } from '../../core/i18n/locale.service';
import { ReputationSeoService } from '../../core/seo/reputation-seo.service';
import { SessionService } from '../../core/services/session.service';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';
import { LandingNavComponent } from '../../shared/components/landing-nav/landing-nav.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import {
  GAIN_CARDS,
  REPUTATION_NAV_LINKS,
  STAIR_STEPS,
  VIS_STAGES,
} from './reputation-guide.config';

@Component({
  selector: 'app-reputation-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'reputation-guide-host',
    '(document:click)': 'onDocumentClick($event)',
  },
  imports: [
    TranslocoModule,
    RouterLink,
    RouterLinkActive,
    LandingNavComponent,
    LandingFooterComponent,
    LanguageSelectorComponent,
    SiteFooterComponent,
    UserAvatarComponent,
  ],
  templateUrl: './reputation-guide.component.html',
  styleUrl: './reputation-guide.component.scss',
})
export class ReputationGuideComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly reputationSeo = inject(ReputationSeoService);
  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuHost = viewChild<ElementRef<HTMLElement>>('menuHost');

  /** Tests may set directly; routes use `data.publicMode` (no withComponentInputBinding). */
  readonly publicModeInput = input(false, { alias: 'publicMode' });

  private readonly routePublicMode = toSignal(
    this.route.data.pipe(map((data) => data['publicMode'] === true)),
    { initialValue: this.route.snapshot.data['publicMode'] === true },
  );

  readonly publicMode = computed(() => this.publicModeInput() || this.routePublicMode());

  readonly menuOpen = signal(false);
  readonly gainCards = GAIN_CARDS;
  readonly stairSteps = STAIR_STEPS;
  readonly visStages = VIS_STAGES;
  readonly navLinks = REPUTATION_NAV_LINKS;

  readonly sessionUser = computed(() => this.session.user());

  ngOnInit(): void {
    const routeLocale = this.route.snapshot.data['locale'] as AppLocale | undefined;
    if (routeLocale) {
      this.locale.setLocale(routeLocale);
    }
    if (this.publicMode()) {
      this.transloco
        .selectTranslation(this.transloco.getActiveLang())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.reputationSeo.apply(this.transloco.getActiveLang() as AppLocale);
        });
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) {
      return;
    }
    const host = this.menuHost()?.nativeElement;
    if (host && !host.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
