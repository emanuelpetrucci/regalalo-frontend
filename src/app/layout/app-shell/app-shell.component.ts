import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter, map, startWith } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { ConversionGateModalComponent } from '../../shared/components/conversion-gate-modal/conversion-gate-modal.component';

interface NavLink {
  id: string;
  labelKey: string;
  path: string;
  /** Rutas hijas activan el enlace (p. ej. /entregas/:id). */
  childRoutes?: boolean;
}

type FooterPlatformSection = 'explorar' | 'mis-objetos' | 'entregas' | 'perfil' | null;

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoModule,
    LanguageSelectorComponent,
    SiteFooterComponent,
    UserAvatarComponent,
    ConversionGateModalComponent,
  ],
  template: `
    <div class="app-shell" *transloco="let t">
      <nav class="navbar" aria-label="Navegación principal">
        <a routerLink="/explorar" class="navbar__logo">Regálalo</a>

        @if (!isGuest()) {
          <div class="nav-links navbar__links">
            @for (link of navLinks; track link.id) {
              <a
                [routerLink]="link.path"
                routerLinkActive="navbar__link--active"
                [routerLinkActiveOptions]="
                  link.childRoutes ? { exact: false } : { exact: true }
                "
                class="navbar__link"
              >
                {{ t(link.labelKey) }}
              </a>
            }
          </div>
        }

        <div class="navbar__actions">
          <app-language-selector />

          @if (isGuest()) {
            <a routerLink="/login" class="navbar__guest-login">
              {{ t('nav.login') }}
            </a>
            <a routerLink="/register" class="btn btn--primary navbar__publish">
              {{ t('nav.register') }}
            </a>
          } @else {
            <a routerLink="/mis-objetos/publicar" class="btn btn--primary navbar__publish pub-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {{ t('nav.publish') }}
            </a>
            <a
              routerLink="/perfil"
              class="navbar__avatar-link"
              [attr.aria-label]="t('nav.profile')"
            >
              <app-user-avatar
                size="sm"
                [firstName]="sessionUser()?.firstName"
                [lastName]="sessionUser()?.lastName"
                [userId]="sessionUser()?.id"
                [decorative]="true"
              />
            </a>
            <div class="navbar__hamburger-wrap" #menuHost>
              <button
                type="button"
                class="navbar__hamburger"
                [class.navbar__hamburger--open]="menuOpen()"
                [attr.aria-expanded]="menuOpen()"
                [attr.aria-label]="t('nav.menu')"
                (click)="toggleMenu($event)"
              >
                @if (menuOpen()) {
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                } @else {
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                }
              </button>
              @if (menuOpen()) {
                <div class="navbar__mobile-menu rlg-nav-menu-in" role="menu">
                  @for (link of navLinks; track link.id) {
                    <a
                      [routerLink]="link.path"
                      routerLinkActive="navbar__mobile-link--active"
                      [routerLinkActiveOptions]="
                        link.childRoutes ? { exact: false } : { exact: true }
                      "
                      class="navbar__mobile-link"
                      role="menuitem"
                      (click)="closeMenu()"
                    >
                      {{ t(link.labelKey) }}
                    </a>
                  }
                  <div class="navbar__mobile-divider" role="separator"></div>
                  <a
                    routerLink="/mis-objetos/publicar"
                    class="navbar__mobile-publish"
                    role="menuitem"
                    (click)="closeMenu()"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {{ t('nav.publish_object') }}
                  </a>
                </div>
              }
            </div>
          }
        </div>
      </nav>

      <main
        class="app-shell__main"
        [class.app-shell__main--guest-mobile-pad]="isGuest()"
      >
        <router-outlet />
      </main>

      @if (isGuest()) {
        <nav
          class="bottom-nav"
          *transloco="let t"
          aria-label="Navegación móvil visitante"
        >
          <a routerLink="/explorar" class="bottom-nav__tab">
            <span class="bottom-nav__tab-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <span class="bottom-nav__label">{{ t('nav.explore') }}</span>
          </a>

          <button
            type="button"
            class="bottom-nav__tab"
            [attr.aria-label]="t('nav.publish_gated_aria')"
            (click)="openPublishGate()"
          >
            <span class="bottom-nav__tab-icon bottom-nav__tab-icon--gated">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span class="bottom-nav__dot-accent" aria-hidden="true"></span>
            </span>
            <span class="bottom-nav__label bottom-nav__label--gated">{{ t('nav.publish') }}</span>
          </button>

          <a routerLink="/login" class="bottom-nav__tab">
            <span class="bottom-nav__tab-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </span>
            <span class="bottom-nav__label">{{ t('nav.login') }}</span>
          </a>
        </nav>
      }

      @if (publishGateOpen()) {
        <app-conversion-gate-modal
          trigger="publish_item"
          (closed)="publishGateOpen.set(false)"
        />
      }

      <app-site-footer [currentPlatform]="currentFooterPlatform()" />
    </div>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly menuHost = viewChild<ElementRef<HTMLElement>>('menuHost');

  readonly menuOpen = signal(false);
  readonly publishGateOpen = signal(false);

  readonly isGuest = computed(() => this.session.user() === null);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly navLinks: NavLink[] = [
    { id: 'explorar', labelKey: 'nav.explore', path: '/explorar' },
    { id: 'mis-objetos', labelKey: 'nav.my_items', path: '/mis-objetos' },
    {
      id: 'entregas',
      labelKey: 'nav.deliveries',
      path: '/entregas',
      childRoutes: true,
    },
    { id: 'perfil', labelKey: 'nav.profile', path: '/perfil' },
  ];

  readonly sessionUser = computed(() => this.session.user());

  readonly currentFooterPlatform = computed<FooterPlatformSection>(() => {
    const url = this.currentUrl();
    if (url.startsWith('/mis-objetos')) return 'mis-objetos';
    if (url.startsWith('/entregas')) return 'entregas';
    if (url.startsWith('/perfil')) return 'perfil';
    if (url.startsWith('/explorar')) return 'explorar';
    return null;
  });

  openPublishGate(): void {
    this.publishGateOpen.set(true);
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
