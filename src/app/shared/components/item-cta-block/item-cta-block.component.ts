import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AlertBoxComponent } from '../alert-box/alert-box.component';

@Component({
  selector: 'app-item-cta-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, AlertBoxComponent],
  templateUrl: './item-cta-block.component.html',
  styleUrl: './item-cta-block.component.scss',
})
export class ItemCtaBlockComponent {
  readonly requestDone = input(false);
  readonly itemPaused = input(false);
  readonly limitReached = input(false);
  readonly canRequest = input(false);
  readonly unavailable = input(false);
  readonly requestErrorKey = input<string | null>(null);
  readonly requestErrorMessage = input('');
  /** Turnos restantes en la ventana de 30 días; null si aún no cargado. */
  readonly remainingSlots = input<number | null>(null);
  readonly pendingContactChannel = input<string | null>(null);
  readonly ctaLabelKey = input('items.detail.cta_interested');
  readonly ctaSize = input<'default' | 'large'>('default');

  readonly request = output<void>();
  readonly editContact = output<void>();

  onRequest(): void {
    this.request.emit();
  }
}
