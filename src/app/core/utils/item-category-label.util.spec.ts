import { describe, expect, it } from 'vitest';
import type { PublishItemMultipart } from '../api/generated/models/publish-item-multipart';
import {
  ITEM_CATEGORIES,
  ITEM_WEIGHT_RANGES,
  itemCategoryLabelKey,
  itemWeightRangeLabelKey,
} from './item-category-label.util';

describe('item-category-label.util', () => {
  it('exposes canonical array lengths', () => {
    expect(ITEM_CATEGORIES.length).toBe(9);
    expect(ITEM_WEIGHT_RANGES.length).toBe(4);
  });

  it('maps each category to items.category.* keys', () => {
    const keys = ITEM_CATEGORIES.map((c) => itemCategoryLabelKey(c));
    expect(keys).toEqual([
      'items.category.furniture',
      'items.category.electronics',
      'items.category.clothing',
      'items.category.books',
      'items.category.toys',
      'items.category.kitchen',
      'items.category.sports',
      'items.category.tools',
      'items.category.other',
    ]);
  });

  it('maps each weight range to items.weight_range.* keys', () => {
    const keys = ITEM_WEIGHT_RANGES.map((w) => itemWeightRangeLabelKey(w));
    expect(keys).toEqual([
      'items.weight_range.lt1',
      'items.weight_range.1to5',
      'items.weight_range.5to20',
      'items.weight_range.gt20',
    ]);
  });

  it('handles numeric enum key 1to5', () => {
    expect(itemWeightRangeLabelKey('1to5')).toBe('items.weight_range.1to5');
  });

  it('arrays match PublishItemMultipart unions', () => {
    const categoryUnion: PublishItemMultipart['category'][] = [...ITEM_CATEGORIES];
    const weightUnion: PublishItemMultipart['weightRange'][] = [
      ...ITEM_WEIGHT_RANGES,
    ];
    expect(categoryUnion).toHaveLength(9);
    expect(weightUnion).toHaveLength(4);
  });
});
