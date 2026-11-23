import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ImageCompressionService } from '../../../core/services/image-compression.service';

@Component({
  selector: 'app-image-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './image-picker.component.html',
  styleUrl: './image-picker.component.scss',
})
export class ImagePickerComponent implements OnDestroy {
  private readonly compressionService = inject(ImageCompressionService);

  readonly maxImages = input(5);
  readonly imagesChange = output<Blob[]>();

  readonly slots = signal<Array<Blob | null>>([null, null, null, null, null]);
  readonly loading = signal<boolean[]>([false, false, false, false, false]);
  readonly errors = signal<string[]>([]);
  readonly slotErrors = signal<boolean[]>([false, false, false, false, false]);

  private readonly previews = signal<Array<string | null>>([null, null, null, null, null]);
  readonly previewUrls = this.previews.asReadonly();

  readonly slotIndices = [0, 1, 2, 3, 4];
  readonly allSlotsFull = computed(() => this.slots().every((s) => s !== null));

  private destroyed = false;

  private readonly fileInputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  ngOnDestroy(): void {
    this.destroyed = true;
    this.previews().forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }

  openFilePicker(): void {
    if (this.loading().some(Boolean)) return;
    this.fileInputRef().nativeElement.click();
  }

  onSlotClick(index: number): void {
    if (this.allSlotsFull() || this.loading().some(Boolean)) return;
    if (this.slots()[index] !== null || this.loading()[index]) return;
    this.openFilePicker();
  }

  onSlotKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSlotClick(index);
    }
  }

  removeSlot(event: Event, index: number): void {
    event.stopPropagation();
    const url = this.previews()[index];
    if (url) URL.revokeObjectURL(url);

    const newSlots = [...this.slots()];
    const newPreviews = [...this.previews()];
    const newLoading = [...this.loading()];
    const newSlotErrors = [...this.slotErrors()];
    newSlots[index] = null;
    newPreviews[index] = null;
    newLoading[index] = false;
    newSlotErrors[index] = false;

    this.slots.set(newSlots);
    this.previews.set(newPreviews);
    this.loading.set(newLoading);
    this.slotErrors.set(newSlotErrors);
    this.imagesChange.emit(newSlots.filter((s): s is Blob => s !== null));
  }

  async onFilesSelected(event: Event): Promise<void> {
    if (this.loading().some(Boolean)) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    input.value = '';

    const currentSlots = this.slots();
    const emptyIndices = currentSlots
      .map((slot, i) => (slot === null ? i : -1))
      .filter((i) => i !== -1);

    if (emptyIndices.length === 0) {
      this.errors.set(['items.image_picker.max_reached']);
      return;
    }

    const filesToProcess = files.slice(0, emptyIndices.length);
    const hadExtras = files.length > emptyIndices.length;

    const newLoading = [...this.loading()];
    filesToProcess.forEach((_, i) => {
      newLoading[emptyIndices[i]] = true;
    });
    this.loading.set(newLoading);
    this.errors.set([]);

    const newSlots = [...this.slots()];
    const newPreviews = [...this.previews()];
    const loadingAfter = [...this.loading()];
    const slotErrorsAfter = [...this.slotErrors()];
    const errorKeys = new Set<string>();

    try {
      const results = await this.compressionService.compress(filesToProcess);

      if (this.destroyed) return;

      if (hadExtras) {
        errorKeys.add('items.image_picker.max_reached');
      }

      results.forEach((result, i) => {
        const slotIndex = emptyIndices[i];
        loadingAfter[slotIndex] = false;
        if (result.status === 'ok' && result.blob) {
          newSlots[slotIndex] = result.blob;
          const prev = newPreviews[slotIndex];
          if (prev) URL.revokeObjectURL(prev);
          newPreviews[slotIndex] = URL.createObjectURL(result.blob);
          slotErrorsAfter[slotIndex] = false;
        } else {
          slotErrorsAfter[slotIndex] = true;
          errorKeys.add(`items.image_picker.${result.status}`);
        }
      });
    } catch {
      if (this.destroyed) return;
      errorKeys.add('items.image_picker.format_invalid');
      emptyIndices.forEach((slotIndex, i) => {
        if (i < filesToProcess.length) {
          loadingAfter[slotIndex] = false;
          slotErrorsAfter[slotIndex] = true;
        }
      });
    } finally {
      if (this.destroyed) return;
      emptyIndices.forEach((slotIndex, i) => {
        if (i < filesToProcess.length) {
          loadingAfter[slotIndex] = false;
        }
      });
      this.slots.set(newSlots);
      this.previews.set(newPreviews);
      this.loading.set(loadingAfter);
      this.slotErrors.set(slotErrorsAfter);
      this.errors.set([...errorKeys]);
      this.imagesChange.emit(newSlots.filter((s): s is Blob => s !== null));
    }
  }
}
