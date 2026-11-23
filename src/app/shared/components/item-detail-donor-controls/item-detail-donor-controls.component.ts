import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { mapPauseItemError } from '../../../features/items/pause-item-error.util';
import { BtnComponent } from '../btn/btn.component';
import { ToggleSwitchComponent } from '../toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-item-detail-donor-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, ToggleSwitchComponent],
  templateUrl: './item-detail-donor-controls.component.html',
  styleUrl: './item-detail-donor-controls.component.scss',
})
export class ItemDetailDonorControlsComponent {
  private readonly itemsApi = inject(ItemsService);
  private readonly transloco = inject(TranslocoService);

  readonly itemId = input.required<string>();
  readonly status = input.required<'active' | 'reserved' | 'completed' | 'cancelled'>();
  readonly requestsPaused = input.required<boolean>();
  readonly createdAt = input.required<string>();
  readonly requestCount = input(0);
  readonly canManagePause = input(false);
  readonly canCancel = input(false);
  readonly showCandidates = input(false);

  readonly pausedChange = output<boolean>();
  readonly toggleCandidates = output<void>();
  readonly cancel = output<Event>();

  readonly pausing = signal(false);
  readonly pauseErrorKey = signal<string | null>(null);

  readonly publishedDaysShort = computed(() => {
    const days = this.daysSince(this.createdAt());
    return `${days}d`;
  });

  readonly pauseTitleId = computed(() => `item-detail-pause-${this.itemId()}`);

  readonly pauseErrorMessage = computed(() => {
    const key = this.pauseErrorKey();
    return key ? this.transloco.translate(key) : '';
  });

  readonly candidatesLabel = computed(() => {
    const count = this.requestCount();
    if (this.showCandidates()) {
      return this.transloco.translate('items.detail.hide_candidates');
    }
    return this.transloco.translate('items.detail.view_candidates', { count });
  });

  async onPauseToggle(nextPaused: boolean): Promise<void> {
    if (this.pausing() || !this.canManagePause()) {
      return;
    }

    this.pausing.set(true);
    this.pauseErrorKey.set(null);

    try {
      const res = await this.itemsApi.itemsIdPausePatch({
        id: this.itemId(),
        body: { paused: nextPaused },
      });
      this.pausedChange.emit(res.requestsPaused);
    } catch (err) {
      const mapped = mapPauseItemError(err);
      if (mapped.bannerKey) {
        this.pauseErrorKey.set(mapped.bannerKey);
      }
    } finally {
      this.pausing.set(false);
    }
  }

  private daysSince(isoDate: string): number {
    const created = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
}
