import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-request-contact-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent],
  templateUrl: './request-contact-bottom-sheet.component.html',
  styleUrl: './request-contact-bottom-sheet.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class RequestContactBottomSheetComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private bodyOverflowBeforeLock: string | null = null;

  readonly open = input(true);
  readonly submitting = input(false);
  readonly fieldErrorKey = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly dismissed = output<void>();

  readonly contactChannelValue = signal('');
  readonly isValid = computed(() => this.contactChannelValue().trim().length > 0);

  constructor() {
    afterNextRender(() => {
      if (this.open()) {
        this.lockBodyScroll();
        this.focusPanel();
      }
    });
    this.destroyRef.onDestroy(() => this.unlockBodyScroll());
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.contactChannelValue.set(value);
  }

  onSubmit(): void {
    if (!this.isValid() || this.submitting()) {
      return;
    }
    this.confirmed.emit(this.contactChannelValue().trim());
  }

  onDismiss(): void {
    if (this.submitting()) {
      return;
    }
    this.dismissed.emit();
  }

  onBackdropClick(): void {
    if (this.submitting()) {
      return;
    }
    this.dismissed.emit();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onEscape(event: Event): void {
    if (!this.open() || this.submitting()) {
      return;
    }
    event.preventDefault();
    this.dismissed.emit();
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.elementRef.nativeElement.querySelector(
      '.contact-sheet__panel',
    );
    if (!panel) {
      return [];
    }
    return Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
  }

  private focusPanel(): void {
    const input = this.elementRef.nativeElement.querySelector(
      '#contact-channel-input',
    ) as HTMLElement | null;
    if (input) {
      input.focus();
      return;
    }
    const panel = this.elementRef.nativeElement.querySelector(
      '.contact-sheet__panel',
    ) as HTMLElement | null;
    panel?.focus();
  }

  private lockBodyScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }
    this.bodyOverflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }
    if (this.bodyOverflowBeforeLock !== null) {
      document.body.style.overflow = this.bodyOverflowBeforeLock;
      this.bodyOverflowBeforeLock = null;
    } else {
      document.body.style.removeProperty('overflow');
    }
  }
}
