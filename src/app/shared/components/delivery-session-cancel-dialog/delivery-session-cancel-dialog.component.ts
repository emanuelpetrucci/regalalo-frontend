import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { BtnComponent } from '../btn/btn.component';

@Component({
  selector: 'app-delivery-session-cancel-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, AlertBoxComponent],
  templateUrl: './delivery-session-cancel-dialog.component.html',
  styleUrl: './delivery-session-cancel-dialog.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class DeliverySessionCancelDialogComponent {
  readonly open = input(true);
  readonly submitting = input(false);
  readonly errorKey = input<string | null>(null);

  readonly confirmed = output<boolean>();
  readonly dismissed = output<void>();

  readonly noShow = signal(false);

  readonly confirmLabelKey = computed(() =>
    this.noShow()
      ? 'items.my_objects.cancel_session.no_show_confirm'
      : 'items.my_objects.cancel_session.confirm',
  );

  onEscape(event: Event): void {
    if (this.submitting()) {
      return;
    }
    event.preventDefault();
    this.dismissed.emit();
  }

  onBackdropClick(): void {
    if (!this.submitting()) {
      this.dismissed.emit();
    }
  }

  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  onDismiss(): void {
    if (!this.submitting()) {
      this.dismissed.emit();
    }
  }

  onNoShowChange(checked: boolean): void {
    if (!this.submitting()) {
      this.noShow.set(checked);
    }
  }

  /** El input está oculto; el label es el control visible (accesible + E2E). */
  onNoShowLabelClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.submitting()) {
      this.noShow.update((value) => !value);
    }
  }

  onConfirm(): void {
    if (!this.submitting()) {
      this.confirmed.emit(this.noShow());
    }
  }
}
