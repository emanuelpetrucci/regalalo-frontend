import { TestBed } from '@angular/core/testing';
import { ImageCompressionService } from './image-compression.service';

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function makeBitmapMock(width: number, height: number): ImageBitmap {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

function makeCanvasMock(blobResult: Blob | null) {
  const ctx = { drawImage: vi.fn() };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(ctx),
    toBlob: vi.fn().mockImplementation(
      (cb: (b: Blob | null) => void, type?: string, quality?: number) => {
        Promise.resolve().then(() => cb(blobResult));
        return type;
      },
    ),
  };
  return { canvas, ctx };
}

function stubCanvasPipeline(width: number, height: number, blobResult: Blob | null) {
  const bitmap = makeBitmapMock(width, height);
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn().mockResolvedValue(bitmap),
  );
  const { canvas } = makeCanvasMock(blobResult);
  vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLElement);
  return { canvas, bitmap };
}

describe('ImageCompressionService', () => {
  let service: ImageCompressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCompressionService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('format validation (AC 4)', () => {
    it('rejects gif as format_invalid', async () => {
      const results = await service.compress([makeFile('img.gif', 'image/gif')]);
      expect(results[0].status).toBe('format_invalid');
      expect(results[0].originalName).toBe('img.gif');
      expect(results[0].blob).toBeUndefined();
    });

    it('rejects bmp as format_invalid', async () => {
      const results = await service.compress([makeFile('img.bmp', 'image/bmp')]);
      expect(results[0].status).toBe('format_invalid');
    });

    it('accepts jpeg, png, and webp', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      const { canvas } = stubCanvasPipeline(400, 300, blob);

      const results = await service.compress([
        makeFile('a.jpg', 'image/jpeg'),
        makeFile('b.png', 'image/png'),
        makeFile('c.webp', 'image/webp'),
      ]);
      expect(results.every((r) => r.status === 'ok')).toBe(true);
      expect(canvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.8,
      );
    });

    it('rejects zero-byte files as format_invalid', async () => {
      const results = await service.compress([makeFile('empty.jpg', 'image/jpeg', 0)]);
      expect(results[0].status).toBe('format_invalid');
    });
  });

  describe('scaling (AC 1)', () => {
    it('scales down images wider than 1200px', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      const { canvas, bitmap } = stubCanvasPipeline(2400, 1600, blob);

      await service.compress([makeFile('wide.jpg', 'image/jpeg')]);

      expect(canvas.width).toBe(1200);
      expect(canvas.height).toBe(800);
      expect((bitmap as unknown as { close: () => void }).close).toHaveBeenCalled();
    });

    it('scales down images taller than 1200px', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      const { canvas } = stubCanvasPipeline(900, 1800, blob);

      await service.compress([makeFile('tall.jpg', 'image/jpeg')]);

      expect(canvas.width).toBe(600);
      expect(canvas.height).toBe(1200);
    });

    it('does not upscale images smaller than 1200px', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      const { canvas } = stubCanvasPipeline(400, 300, blob);

      await service.compress([makeFile('small.jpg', 'image/jpeg')]);

      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });
  });

  describe('post-compression size validation (AC 3)', () => {
    it('returns too_large when blob exceeds 2 MB', async () => {
      const bigBlob = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/webp' });
      stubCanvasPipeline(800, 600, bigBlob);

      const results = await service.compress([makeFile('heavy.jpg', 'image/jpeg')]);
      expect(results[0].status).toBe('too_large');
      expect(results[0].blob).toBeUndefined();
    });

    it('returns too_large when toBlob returns null', async () => {
      stubCanvasPipeline(800, 600, null);

      const results = await service.compress([makeFile('fail.jpg', 'image/jpeg')]);
      expect(results[0].status).toBe('too_large');
    });

    it('accepts blob exactly at 2 MB boundary', async () => {
      const exactBlob = new Blob([new Uint8Array(2 * 1024 * 1024)], { type: 'image/webp' });
      stubCanvasPipeline(800, 600, exactBlob);

      const results = await service.compress([makeFile('edge.jpg', 'image/jpeg')]);
      expect(results[0].status).toBe('ok');
    });
  });

  describe('decode failures', () => {
    it('returns format_invalid when createImageBitmap rejects', async () => {
      vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode fail')));

      const results = await service.compress([makeFile('bad.jpg', 'image/jpeg')]);
      expect(results[0].status).toBe('format_invalid');
    });

    it('isolates failure so sibling files still compress', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      let call = 0;
      vi.stubGlobal('createImageBitmap', vi.fn().mockImplementation(() => {
        call += 1;
        if (call === 1) return Promise.reject(new Error('fail'));
        return Promise.resolve(makeBitmapMock(400, 300));
      }));
      const { canvas } = makeCanvasMock(blob);
      vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLElement);

      const results = await service.compress([
        makeFile('bad.jpg', 'image/jpeg'),
        makeFile('ok.jpg', 'image/jpeg'),
      ]);
      expect(results[0].status).toBe('format_invalid');
      expect(results[1].status).toBe('ok');
    });
  });

  describe('multiple files (AC 1)', () => {
    it('processes up to 5 files and returns results in order', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      stubCanvasPipeline(400, 300, blob);

      const files = Array.from({ length: 5 }, (_, i) =>
        makeFile(`img${i}.jpg`, 'image/jpeg'),
      );
      const results = await service.compress(files);

      expect(results).toHaveLength(5);
      expect(results.every((r) => r.status === 'ok')).toBe(true);
    });

    it('mixes ok and format_invalid results', async () => {
      const blob = new Blob([new Uint8Array(100)], { type: 'image/webp' });
      stubCanvasPipeline(400, 300, blob);

      const results = await service.compress([
        makeFile('ok.jpg', 'image/jpeg'),
        makeFile('bad.gif', 'image/gif'),
      ]);

      expect(results[0].status).toBe('ok');
      expect(results[1].status).toBe('format_invalid');
    });
  });
});
