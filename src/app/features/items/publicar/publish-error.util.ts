import { HttpErrorResponse } from '@angular/common/http';

export interface PublishErrorView {
  bannerKey?: string;
  fields?: Record<string, string>;
}

const FIELD_I18N: Record<string, string> = {
  title: 'items.publish.errors.field_title',
  description: 'items.publish.errors.field_description',
  condition: 'items.publish.errors.field_condition',
  category: 'items.publish.errors.field_category',
  weightRange: 'items.publish.errors.field_weight_range',
  postalCode: 'items.publish.errors.field_postal_code',
  images: 'items.publish.errors.field_images',
};

function normalizeFieldKey(path: string): string | undefined {
  const normalized = path.toLowerCase().replace(/_/g, '').replace(/\[\d*\]$/, '');
  if (normalized === 'title') return 'title';
  if (normalized === 'description') return 'description';
  if (normalized === 'condition') return 'condition';
  if (normalized === 'category') return 'category';
  if (normalized === 'weightrange') return 'weightRange';
  if (normalized === 'postalcode') return 'postalCode';
  if (normalized === 'images' || normalized.startsWith('images')) return 'images';
  return undefined;
}

function mapRecordErrors(
  errors: Record<string, string[] | string>,
): Record<string, string> | undefined {
  const fields: Record<string, string> = {};
  for (const [path, messages] of Object.entries(errors)) {
    const field = normalizeFieldKey(path);
    if (!field) continue;
    const msg = Array.isArray(messages) ? messages[0] : messages;
    if (msg) {
      fields[field] = FIELD_I18N[field] ?? 'items.publish.errors.field_invalid';
    }
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

function mapArrayErrors(
  items: Array<{ path?: string; message?: string } | null>,
): Record<string, string> | undefined {
  const fields: Record<string, string> = {};
  for (const item of items) {
    if (!item?.path) continue;
    const field = normalizeFieldKey(item.path);
    if (field) {
      fields[field] = FIELD_I18N[field] ?? 'items.publish.errors.field_invalid';
    }
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

export function mapPublishError(err: unknown): PublishErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'items.publish.errors.connection' };
  }

  if (err.status === 401) {
    return {};
  }

  if (err.status === 400 || err.status === 422) {
    const body = err.error as {
      message?: string;
      errors?: Record<string, string[] | string> | Array<{ path?: string; message?: string } | null>;
    };

    if (body?.errors && !Array.isArray(body.errors)) {
      const fields = mapRecordErrors(body.errors);
      if (fields) return { fields };
    }

    if (Array.isArray(body?.errors)) {
      const fields = mapArrayErrors(body.errors);
      if (fields) return { fields };
    }

    const msg = body?.message ?? '';
    if (/postal|código|geocod/i.test(msg)) {
      return { fields: { postalCode: 'items.publish.errors.field_postal_code' } };
    }
    if (/imagen|image|foto/i.test(msg)) {
      return { fields: { images: 'items.publish.errors.field_images' } };
    }

    return { bannerKey: 'items.publish.errors.generic' };
  }

  return { bannerKey: 'items.publish.errors.generic' };
}
