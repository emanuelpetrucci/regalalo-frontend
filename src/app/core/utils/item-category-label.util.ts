import type { PublishItemMultipart } from '../api/generated/models/publish-item-multipart';

export type ItemCategory = PublishItemMultipart['category'];
export type ItemWeightRange = PublishItemMultipart['weightRange'];

/** Orden estable — delta DLT-004 §4 Cambio 1 */
export const ITEM_CATEGORIES: readonly ItemCategory[] = [
  'furniture',
  'electronics',
  'clothing',
  'books',
  'toys',
  'kitchen',
  'sports',
  'tools',
  'other',
] as const;

export const ITEM_WEIGHT_RANGES: readonly ItemWeightRange[] = [
  'lt1',
  '1to5',
  '5to20',
  'gt20',
] as const;

const ITEM_CATEGORY_SET = new Set<string>(ITEM_CATEGORIES);

export function normalizeItemCategory(value: unknown): ItemCategory {
  if (typeof value === 'string' && ITEM_CATEGORY_SET.has(value)) {
    return value as ItemCategory;
  }
  return 'other';
}

export function itemCategoryLabelKey(category: ItemCategory): string {
  return `items.category.${normalizeItemCategory(category)}`;
}

export function itemWeightRangeLabelKey(weightRange: ItemWeightRange): string {
  return `items.weight_range.${weightRange}`;
}
