import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import type { ItemDonor } from '../../../core/api/generated/models/item-donor';
import { ItemCtaBlockComponent } from '../item-cta-block/item-cta-block.component';
import { ItemDonorRowComponent } from '../item-donor-row/item-donor-row.component';

@Component({
  selector: 'app-item-detail-receiver-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, ItemCtaBlockComponent, ItemDonorRowComponent],
  templateUrl: './item-detail-receiver-controls.component.html',
  styleUrl: './item-detail-receiver-controls.component.scss',
})
export class ItemDetailReceiverControlsComponent {
  readonly donor = input.required<ItemDonor>();
  readonly itemPaused = input(false);
  readonly requestDone = input(false);
  readonly limitReached = input(false);
  readonly canRequest = input(false);
  readonly unavailable = input(false);
  readonly remainingSlots = input<number | null>(null);
  readonly requestErrorKey = input<string | null>(null);
  readonly requestErrorMessage = input('');

  readonly request = output<void>();
}
