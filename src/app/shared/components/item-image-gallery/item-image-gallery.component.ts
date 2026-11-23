import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-item-image-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './item-image-gallery.component.html',
  styleUrl: './item-image-gallery.component.scss',
})
export class ItemImageGalleryComponent {
  readonly images = input.required<string[]>();
  readonly title = input.required<string>();
  /** `hero` = 16:9 cover, sin miniaturas (panel Entregas). `detail` = 4:3 con miniaturas (página detalle). `panel` = 16:10 con miniaturas (cajón Explorar). */
  readonly layout = input<'default' | 'hero' | 'detail' | 'panel'>('default');
  readonly selectedIndex = model(0);

  private readonly thumbButtons = viewChildren<ElementRef<HTMLButtonElement>>('thumbBtn');

  readonly imageCount = computed(() => this.images().length);
  readonly currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.selectedIndex();
    return imgs[idx] ?? null;
  });
  readonly canGoPrev = computed(() => this.selectedIndex() > 0);
  readonly canGoNext = computed(
    () => this.selectedIndex() < this.imageCount() - 1,
  );
  readonly counterCurrent = computed(() => this.selectedIndex() + 1);

  selectIndex(index: number): void {
    if (index >= 0 && index < this.imageCount()) {
      this.selectedIndex.set(index);
      this.focusActiveThumb();
    }
  }

  prev(): void {
    if (this.canGoPrev()) {
      this.selectedIndex.update((i) => i - 1);
      this.focusActiveThumb();
    }
  }

  next(): void {
    if (this.canGoNext()) {
      this.selectedIndex.update((i) => i + 1);
      this.focusActiveThumb();
    }
  }

  private focusActiveThumb(): void {
    queueMicrotask(() => {
      const idx = this.selectedIndex();
      this.thumbButtons()[idx]?.nativeElement.focus();
    });
  }
}
