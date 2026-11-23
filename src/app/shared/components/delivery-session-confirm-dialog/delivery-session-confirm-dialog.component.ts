import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { BtnComponent } from '../btn/btn.component';

@Component({
  selector: 'app-delivery-session-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, AlertBoxComponent],
  templateUrl: './delivery-session-confirm-dialog.component.html',
  styleUrl: './delivery-session-confirm-dialog.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class DeliverySessionConfirmDialogComponent {
  readonly open = input(true);
  readonly submitting = input(false);
  readonly errorKey = input<string | null>(null);
  readonly isFirstDelivery = input(false);

  readonly confirmed = output<void>();
  readonly dismissed = output<void>();

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

  onConfirm(): void {
    if (!this.submitting()) {
      this.confirmed.emit();
    }
  }

  onDismiss(): void {
    if (!this.submitting()) {
      this.dismissed.emit();
    }
  }
}
