import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import { ImagePickerComponent } from './image-picker.component';

const esJson = {
  items: {
    image_picker: {
      add: 'Añadir',
      main: 'Principal',
      photo_n: 'Foto {{n}}',
      remove: 'Eliminar foto',
      processing: 'Procesando…',
      format_invalid: 'Formato no compatible. Usa JPG, PNG o WebP.',
      too_large: 'La imagen supera el límite de 2 MB después de comprimir.',
      max_reached: 'Máximo 5 fotos por objeto.',
      hint: 'Formatos: JPG, PNG, WEBP · Máx. 2 MB por imagen · Se comprimen automáticamente',
    },
  },
};

function makeEvent(files: File[]): Event {
  const event = new Event('change');
  Object.defineProperty(event, 'target', {
    value: { files, value: '' },
  });
  return event;
}

function makeFile(name: string, type = 'image/jpeg'): File {
  return new File(['x'], name, { type });
}

describe('ImagePickerComponent', () => {
  let compressMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    compressMock = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        ImagePickerComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: ImageCompressionService, useValue: { compress: compressMock } },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(ImagePickerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders 5 empty slots initially (AC 2)', () => {
    const fixture = createFixture();
    const el: HTMLElement = fixture.nativeElement;
    const empty = el.querySelectorAll('.picker__slot--empty');
    expect(empty).toHaveLength(5);
  });

  it('shows "Principal" for first slot and "Añadir" for others', () => {
    const fixture = createFixture();
    const el: HTMLElement = fixture.nativeElement;
    const slots = el.querySelectorAll('.picker__slot--empty');
    expect(slots[0].textContent).toContain('Principal');
    expect(slots[1].textContent).toContain('Añadir');
    expect(slots[4].textContent).toContain('Añadir');
  });

  it('shows hint text', () => {
    const fixture = createFixture();
    const hint = (fixture.nativeElement as HTMLElement).querySelector('.picker__hint');
    expect(hint?.textContent).toContain('JPG, PNG, WEBP');
    expect(hint?.textContent).toContain('por imagen');
  });

  it('shows preview and filled state after successful compression (AC 5)', async () => {
    const blob = new Blob(['data'], { type: 'image/webp' });
    compressMock.mockResolvedValue([{ status: 'ok', blob, originalName: 'img.jpg' }]);

    const fixture = createFixture();
    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('img.jpg')]));
    fixture.detectChanges();

    const filled = (fixture.nativeElement as HTMLElement).querySelector('.picker__slot--filled');
    expect(filled).not.toBeNull();
    expect(filled?.querySelector('img')?.getAttribute('src')).toBe('blob:fake-url');
  });

  it('shows "Principal" label on first filled slot', async () => {
    const blob = new Blob(['data'], { type: 'image/webp' });
    compressMock.mockResolvedValue([{ status: 'ok', blob, originalName: 'img.jpg' }]);

    const fixture = createFixture();
    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('img.jpg')]));
    fixture.detectChanges();

    const caption = (fixture.nativeElement as HTMLElement).querySelector('.picker__slot-caption');
    expect(caption?.textContent?.trim()).toBe('Principal');
  });

  it('emits imagesChange with blobs on successful compression (AC 5)', async () => {
    const blob = new Blob(['data'], { type: 'image/webp' });
    compressMock.mockResolvedValue([{ status: 'ok', blob, originalName: 'a.jpg' }]);

    const fixture = createFixture();
    const emitted: Blob[][] = [];
    fixture.componentInstance.imagesChange.subscribe((blobs: Blob[]) => emitted.push(blobs));

    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('a.jpg')]));

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toHaveLength(1);
    expect(emitted[0][0]).toBe(blob);
  });

  it('shows format_invalid error (AC 4)', async () => {
    compressMock.mockResolvedValue([{ status: 'format_invalid', originalName: 'img.gif' }]);

    const fixture = createFixture();
    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('img.gif', 'image/gif')]));
    fixture.detectChanges();

    const errors = (fixture.nativeElement as HTMLElement).querySelector('.picker__errors');
    expect(errors?.textContent).toContain('Formato no compatible');
    const errorSlot = (fixture.nativeElement as HTMLElement).querySelector('.picker__slot--error');
    expect(errorSlot).not.toBeNull();
  });

  it('shows too_large error (AC 3)', async () => {
    compressMock.mockResolvedValue([{ status: 'too_large', originalName: 'big.jpg' }]);

    const fixture = createFixture();
    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('big.jpg')]));
    fixture.detectChanges();

    const errors = (fixture.nativeElement as HTMLElement).querySelector('.picker__errors');
    expect(errors?.textContent).toContain('supera el límite');
  });

  it('shows max_reached when all 5 slots are occupied (AC 2)', async () => {
    const blob = new Blob(['x'], { type: 'image/webp' });
    const fixture = createFixture();
    fixture.componentInstance.slots.set([blob, blob, blob, blob, blob]);
    fixture.detectChanges();

    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('extra.jpg')]));
    fixture.detectChanges();

    const errors = (fixture.nativeElement as HTMLElement).querySelector('.picker__errors');
    expect(errors?.textContent).toContain('Máximo 5');
    expect(compressMock).not.toHaveBeenCalled();
  });

  it('limits files to available empty slots and shows max_reached (AC 2)', async () => {
    const blob = new Blob(['data'], { type: 'image/webp' });
    compressMock.mockResolvedValue([
      { status: 'ok', blob, originalName: 'a.jpg' },
      { status: 'ok', blob, originalName: 'b.jpg' },
    ]);

    const fixture = createFixture();
    // 3 slots filled, 2 empty
    const existingBlob = new Blob(['x'], { type: 'image/webp' });
    fixture.componentInstance.slots.set([existingBlob, existingBlob, existingBlob, null, null]);
    fixture.detectChanges();

    const files = Array.from({ length: 4 }, (_, i) => makeFile(`img${i}.jpg`));
    await fixture.componentInstance.onFilesSelected(makeEvent(files));
    fixture.detectChanges();

    // Only 2 files should be compressed (2 empty slots)
    expect(compressMock).toHaveBeenCalledWith(files.slice(0, 2));

    const errors = (fixture.nativeElement as HTMLElement).querySelector('.picker__errors');
    expect(errors?.textContent).toContain('Máximo 5');
  });

  it('keeps error messages when removing an unrelated slot', async () => {
    compressMock.mockResolvedValue([{ status: 'format_invalid', originalName: 'bad.gif' }]);

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    const blob = new Blob(['ok'], { type: 'image/webp' });
    comp.slots.set([blob, null, null, null, null]);
    comp.errors.set(['items.image_picker.format_invalid']);
    fixture.detectChanges();

    comp.removeSlot(new MouseEvent('click'), 0);
    fixture.detectChanges();

    expect(comp.errors()).toContain('items.image_picker.format_invalid');
  });

  it('ignores a second file selection while compression is in progress', async () => {
    let resolveCompression!: (v: unknown) => void;
    compressMock.mockReturnValue(new Promise((r) => { resolveCompression = r; }));

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    const promise1 = comp.onFilesSelected(makeEvent([makeFile('a.jpg')]));
    comp.onFilesSelected(makeEvent([makeFile('b.jpg')]));

    resolveCompression([{ status: 'ok', blob: new Blob(['x'], { type: 'image/webp' }), originalName: 'a.jpg' }]);
    await promise1;

    expect(compressMock).toHaveBeenCalledTimes(1);
  });

  it('removes a slot and emits updated blobs', async () => {
    const blob1 = new Blob(['1'], { type: 'image/webp' });
    const blob2 = new Blob(['2'], { type: 'image/webp' });
    compressMock
      .mockResolvedValueOnce([{ status: 'ok', blob: blob1, originalName: '1.jpg' }])
      .mockResolvedValueOnce([{ status: 'ok', blob: blob2, originalName: '2.jpg' }]);

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    const emitted: Blob[][] = [];
    comp.imagesChange.subscribe((blobs: Blob[]) => emitted.push(blobs));

    await comp.onFilesSelected(makeEvent([makeFile('1.jpg')]));
    await comp.onFilesSelected(makeEvent([makeFile('2.jpg')]));
    fixture.detectChanges();

    comp.removeSlot(new MouseEvent('click'), 0);
    fixture.detectChanges();

    expect(comp.slots()[0]).toBeNull();
    expect(emitted.at(-1)).toEqual([blob2]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('revokes all preview URLs on destroy', async () => {
    const blob = new Blob(['data'], { type: 'image/webp' });
    compressMock.mockResolvedValue([{ status: 'ok', blob, originalName: 'img.jpg' }]);

    const fixture = createFixture();
    await fixture.componentInstance.onFilesSelected(makeEvent([makeFile('img.jpg')]));
    fixture.detectChanges();

    fixture.destroy();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('shows loading slot during compression', () => {
    // Trigger loading state without awaiting (hold promise)
    let resolveCompression!: (v: unknown) => void;
    compressMock.mockReturnValue(new Promise((r) => { resolveCompression = r; }));

    const fixture = createFixture();
    const comp = fixture.componentInstance;

    // Manually trigger the loading state
    comp.loading.set([true, false, false, false, false]);
    comp.slots.set([null, null, null, null, null]);
    fixture.detectChanges();

    const loadingSlot = (fixture.nativeElement as HTMLElement).querySelector('.picker__slot--loading');
    expect(loadingSlot).not.toBeNull();

    resolveCompression([]);
  });
});
