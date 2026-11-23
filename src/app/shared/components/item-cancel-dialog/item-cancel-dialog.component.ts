import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { BtnComponent } from '../btn/btn.component';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-item-cancel-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, AlertBoxComponent],
  templateUrl: './item-cancel-dialog.component.html',
  styleUrl: './item-cancel-dialog.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class ItemCancelDialogComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private bodyOverflowBeforeLock: string | null = null;

  readonly open = input(true);
  readonly itemTitle = input<string | undefined>(undefined);
  readonly hasActiveDeliverySession = input(false);
  readonly cancelling = input(false);
  readonly errorKey = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly dismissed = output<void>();

  constructor() {
    afterNextRender(() => {
      if (this.open()) {
        this.lockBodyScroll();
        this.focusPanel();
      }
    });

    this.destroyRef.onDestroy(() => this.unlockBodyScroll());
  }

  onEscape(event: Event): void {
    if (!this.open() || this.cancelling()) {
      return;
    }
    event.preventDefault();
    this.dismissed.emit();
  }

  onBackdropClick(): void {
    if (this.cancelling()) {
      return;
    }
    this.dismissed.emit();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
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
      return;
    }
  }

  onConfirm(): void {
    if (this.cancelling()) {
      return;
    }
    this.confirmed.emit();
  }

  onDismiss(): void {
    if (this.cancelling()) {
      return;
    }
    this.dismissed.emit();
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.elementRef.nativeElement.querySelector(
      '.cancel-dialog__panel',
    );
    if (!panel) {
      return [];
    }
    return Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
  }

  private focusPanel(): void {
    const panel = this.elementRef.nativeElement.querySelector(
      '.cancel-dialog__panel',
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
