import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { fromEvent } from 'rxjs';
import { AppLocale, LocaleService } from '../../../core/i18n/locale.service';

const LANG_IDS: AppLocale[] = ['es', 'ca', 'en'];
type LanguageSelectorVariant = 'compact' | 'field';

@Component({
  selector: 'app-language-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <div
      class="lang-selector"
      [class.lang-selector--open]="open()"
      [class.lang-selector--dark]="dark()"
      [class.lang-selector--field]="variant() === 'field'"
      *transloco="let t"
    >
      <button
        type="button"
        class="lang-selector__toggle"
        data-testid="lang-selector-btn"
        [attr.aria-expanded]="open()"
        aria-haspopup="menu"
        (click)="toggleOpen()"
        (keydown.escape)="close()"
      >
        @if (variant() === 'field') {
          <span>{{ t('common.language.' + activeLocale()) }}</span>
        } @else {
          <span>{{ activeLocale().toUpperCase() }}</span>
        }
        <span class="sr-only">{{ t('language_selector.aria_label') }}</span>
        <svg
          class="lang-selector__icon"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      @if (open()) {
        <div class="lang-selector__list" role="menu">
          @for (id of langIds; track id) {
            <button
              type="button"
              role="menuitem"
              class="lang-selector__option"
              [class.lang-selector__option--active]="id === activeLocale()"
              [attr.aria-current]="id === activeLocale() ? 'true' : null"
              [attr.data-testid]="'lang-option-' + id"
              (click)="select(id)"
              (keydown.escape)="close()"
            >
              <span>{{ t('common.language.' + id) }}</span>
              @if (variant() !== 'field') {
                <span class="lang-selector__option-code" aria-hidden="true">{{ id.toUpperCase() }}</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .lang-selector {
      position: relative;
      display: inline-block;
    }

    .lang-selector__toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid #D5D9DE;
      background: #FFFFFF;
      color: #606A76;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all 150ms;
      line-height: 1.4;

      &:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
      }
    }

    .lang-selector__icon {
      flex-shrink: 0;
      transition: transform 150ms;
    }

    .lang-selector--open .lang-selector__icon {
      transform: rotate(180deg);
    }

    .lang-selector__list {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 130px;
      margin: 0;
      border-radius: 10px;
      background: #FFFFFF;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      z-index: 50;
    }

    .lang-selector__option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 9px 14px;
      border: none;
      background: transparent;
      color: #14171A;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 400;
      cursor: pointer;
      text-align: left;
      gap: 10px;
      transition: background 100ms;

      &:hover {
        background: #E8EAEC;
      }

      &:focus-visible {
        outline: none;
        background: #E8EAEC;
      }

      &--active {
        background: #F0F5F2;
        color: #3A7358;
        font-weight: 600;

        &:hover,
        &:focus-visible {
          background: #F0F5F2;
        }

        .lang-selector__option-code {
          color: #3A7358;
        }
      }
    }

    .lang-selector__option-code {
      font-size: 11px;
      font-weight: 600;
      color: #9AA2AD;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }

    .lang-selector--dark .lang-selector__toggle {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.22);
      color: rgba(255, 255, 255, 0.85);
    }

    .lang-selector--field {
      width: 100%;
      max-width: 260px;
    }

    .lang-selector--field .lang-selector__toggle {
      width: 100%;
      justify-content: space-between;
      padding: 8px 12px;
      border-width: 1.5px;
      color: #14171A;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.35;
    }

    .lang-selector--field .lang-selector__list {
      left: 0;
      right: auto;
      width: 100%;
      min-width: 100%;
    }

    .lang-selector--field .lang-selector__option {
      justify-content: flex-start;
      font-size: 14px;
    }
  `,
})
export class LanguageSelectorComponent {
  private readonly locale = inject(LocaleService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly dark = input(false);
  readonly variant = input<LanguageSelectorVariant>('compact');
  readonly selected = output<AppLocale>();
  readonly langIds = LANG_IDS;
  readonly open = signal(false);
  readonly activeLocale = computed(() => this.locale.currentLocale());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    afterNextRender(() => {
      fromEvent<MouseEvent>(document, 'mousedown')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          if (!this.el.nativeElement.contains(e.target as Node)) {
            this.open.set(false);
          }
        });
    });
  }

  toggleOpen(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  select(id: AppLocale): void {
    this.locale.setLocale(id);
    this.selected.emit(id);
    this.open.set(false);
  }
}
