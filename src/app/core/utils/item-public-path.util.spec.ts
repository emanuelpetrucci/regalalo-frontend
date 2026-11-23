import { describe, expect, it } from 'vitest';
import { isItemUuidV4, itemPublicPathSegment, itemPublicUrl } from './item-public-path.util';

describe('item-public-path.util', () => {
  it('detects UUID v4 route segments', () => {
    expect(isItemUuidV4('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')).toBe(true);
    expect(isItemUuidV4('bicicleta-montana')).toBe(false);
    expect(isItemUuidV4('not-a-uuid')).toBe(false);
  });

  it('builds public item URLs from slug', () => {
    expect(itemPublicUrl('https://regalalo.org/', { slug: 'mesa-de-madera' })).toBe(
      'https://regalalo.org/items/mesa-de-madera',
    );
  });

  it('falls back to id when slug is empty', () => {
    const item = { slug: '  ', id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' };
    expect(itemPublicPathSegment(item)).toBe(item.id);
    expect(itemPublicUrl('https://regalalo.org', item)).toBe(
      `https://regalalo.org/items/${item.id}`,
    );
  });

  it('returns an empty URL when slug and id are missing', () => {
    expect(itemPublicUrl('https://regalalo.org', { slug: '', id: '' })).toBe('');
  });
});
