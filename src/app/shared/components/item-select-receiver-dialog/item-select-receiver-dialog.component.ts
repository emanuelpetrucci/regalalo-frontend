import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { BtnComponent } from '../btn/btn.component';
import { ContactChannelFieldComponent } from '../contact-channel-field/contact-channel-field.component';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function daysSinceRequestDate(iso: string): number | null {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return null;
  }
  return Math.floor((Date.now() - ms) / 86_400_000);
}

@Component({
  selector: 'app-item-select-receiver-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    BtnComponent,
    AlertBoxComponent,
    UserAvatarComponent,
    ContactChannelFieldComponent,
  ],
  templateUrl: './item-select-receiver-dialog.component.html',
  styleUrl: './item-select-receiver-dialog.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class ItemSelectReceiverDialogComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private bodyOverflowBeforeLock: string | null = null;

  private readonly channelField = viewChild(ContactChannelFieldComponent);

  readonly open = input(true);
  readonly candidate = input.required<RankedCandidate>();
  readonly submitting = input(false);
  readonly errorKey = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly dismissed = output<void>();

  readonly scoreDisplay = computed(() => {
    const score = this.candidate().reputationScore;
    return score > 0 ? `+${score}` : `${score}`;
  });

  readonly scoreTone = computed(() => {
    const score = this.candidate().reputationScore;
    if (score >= 60) {
      return 'good';
    }
    if (score >= 20) {
      return 'fair';
    }
    return 'low';
  });

  readonly distanceKm = computed(() =>
    formatDistanceKm(this.candidate().distanceMeters),
  );

  readonly requestAgoKey = computed(() => {
    const days = daysSinceRequestDate(this.candidate().requestDate);
    if (days === null) {
      return 'items.my_objects.days_today';
    }
    if (days <= 0) {
      return 'items.my_objects.days_today';
    }
    if (days === 1) {
      return 'items.my_objects.days_yesterday';
    }
    return 'items.my_objects.days_ago';
  });

  readonly requestAgoParams = computed(() => {
    const days = daysSinceRequestDate(this.candidate().requestDate);
    return days !== null && days > 1 ? { days } : undefined;
  });

  constructor() {
    afterNextRender(() => {
      if (this.open()) {
        this.lockBodyScroll();
        this.focusPanel();
      }
    });

    this.destroyRef.onDestroy(() => this.unlockBodyScroll());

    effect(() => {
      if (!this.open()) {
        return;
      }
      queueMicrotask(() => this.channelField()?.reset());
    });
  }

  onEscape(event: Event): void {
    if (!this.open() || this.submitting()) {
      return;
    }
    event.preventDefault();
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

  onFormSubmit(event: Event): void {
    event.preventDefault();
    this.onConfirm();
  }

  onConfirm(): void {
    if (this.submitting()) {
      return;
    }

    const channel = this.channelField()?.buildChannel();
    if (!channel) {
      return;
    }

    this.confirmed.emit(channel);
  }

  onDismiss(): void {
    if (this.submitting()) {
      return;
    }
    this.dismissed.emit();
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.elementRef.nativeElement.querySelector(
      '.item-select-receiver-dialog__panel',
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
      '.item-select-receiver-dialog__panel',
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
