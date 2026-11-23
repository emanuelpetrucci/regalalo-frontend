import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { mapPauseItemError } from '../../../features/items/pause-item-error.util';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { ToggleSwitchComponent } from '../toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-item-pause-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, ToggleSwitchComponent, AlertBoxComponent],
  templateUrl: './item-pause-control.component.html',
  styleUrl: './item-pause-control.component.scss',
})
export class ItemPauseControlComponent {
  private readonly itemsApi = inject(ItemsService);
  private readonly transloco = inject(TranslocoService);

  readonly itemId = input.required<string>();
  readonly requestsPaused = input.required<boolean>();
  readonly disabled = input(false);

  readonly pausedChange = output<boolean>();

  readonly pausing = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly titleId = computed(() => `item-pause-title-${this.itemId()}`);

  constructor() {
    effect(() => {
      this.requestsPaused();
      this.errorKey.set(null);
    });
  }

  readonly errorMessage = computed(() => {
    const key = this.errorKey();
    return key ? this.transloco.translate(key) : '';
  });

  async onToggle(nextPaused: boolean): Promise<void> {
    if (this.pausing() || this.disabled()) {
      return;
    }

    this.pausing.set(true);
    this.errorKey.set(null);

    try {
      const res = await this.itemsApi.itemsIdPausePatch({
        id: this.itemId(),
        body: { paused: nextPaused },
      });
      this.pausedChange.emit(res.requestsPaused);
    } catch (err) {
      const mapped = mapPauseItemError(err);
      if (mapped.bannerKey) {
        this.errorKey.set(mapped.bannerKey);
      }
    } finally {
      this.pausing.set(false);
    }
  }
}
