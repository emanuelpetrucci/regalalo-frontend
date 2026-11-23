import { Injectable } from '@angular/core';

export type CompressionStatus = 'ok' | 'format_invalid' | 'too_large';

export interface CompressionResult {
  status: CompressionStatus;
  blob?: Blob;
  originalName: string;
}

@Injectable({ providedIn: 'root' })
export class ImageCompressionService {
  private readonly accepted = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSide = 1200;
  private readonly maxSize = 2 * 1024 * 1024;
  private readonly quality = 0.8;

  private async compressOne(file: File): Promise<CompressionResult> {
    if (!file.size || !this.accepted.includes(file.type)) {
      return { status: 'format_invalid', originalName: file.name };
    }

    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      if (!bitmap.width || !bitmap.height) {
        return { status: 'format_invalid', originalName: file.name };
      }

      const scale = Math.min(1, this.maxSide / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { status: 'format_invalid', originalName: file.name };
      }
      ctx.drawImage(bitmap, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', this.quality),
      );

      if (!blob || blob.size > this.maxSize) {
        return { status: 'too_large', originalName: file.name };
      }
      return { status: 'ok', blob, originalName: file.name };
    } catch {
      return { status: 'format_invalid', originalName: file.name };
    } finally {
      bitmap?.close();
    }
  }

  compress(files: FileList | File[]): Promise<CompressionResult[]> {
    const list = Array.from(files);
    return Promise.all(
      list.map((file) =>
        this.compressOne(file).catch(() => ({
          status: 'format_invalid' as const,
          originalName: file.name,
        })),
      ),
    );
  }
}
