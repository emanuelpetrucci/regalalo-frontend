import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ItemDetailPanelComponent } from '../item-detail-panel/item-detail-panel.component';

@Component({
  selector: 'app-item-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemDetailPanelComponent],
  templateUrl: './item-detail-modal.component.html',
  styleUrl: './item-detail-modal.component.scss',
})
export class ItemDetailModalComponent {
  private readonly doc = inject(DOCUMENT);

  readonly itemId = input.required<string>();
  readonly closed = output<void>();
  readonly closing = signal(false);

  private touchStartY = 0;
  private touchStartX = 0;
  private readonly HEADER_ZONE_HEIGHT = 72;
  private readonly SWIPE_CLOSE_THRESHOLD = 72;
  private readonly CLOSE_ANIM_MS = 260;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.doc.body.style.overflow = 'hidden';
    destroyRef.onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  requestClose(): void {
    if (this.closing()) return;
    this.closing.set(true);
    setTimeout(() => this.closed.emit(), this.CLOSE_ANIM_MS);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const t = event.changedTouches[0];
    const deltaY = t.clientY - this.touchStartY;
    const deltaX = Math.abs(t.clientX - this.touchStartX);

    if (deltaY <= this.SWIPE_CLOSE_THRESHOLD || deltaX >= deltaY) {
      return;
    }

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const startedInHeader = this.touchStartY - rect.top < this.HEADER_ZONE_HEIGHT;
    const bodyEl = el.querySelector('.item-detail-panel__body') as HTMLElement | null;

    if (startedInHeader || (bodyEl?.scrollTop ?? 0) <= 2) {
      this.requestClose();
    }
  }
}
