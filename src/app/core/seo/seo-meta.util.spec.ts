import { inferOgImageMimeType, truncateSeoDescription } from './seo-meta.util';

describe('seo-meta.util', () => {
  describe('truncateSeoDescription', () => {
    it('returns short text unchanged', () => {
      expect(truncateSeoDescription('Hola mundo')).toBe('Hola mundo');
    });

    it('truncates at word boundary and adds ellipsis', () => {
      const long =
        'Esta es una descripción muy larga que supera claramente el límite de ciento sesenta caracteres y debe cortarse en un espacio antes de añadir los puntos suspensivos finales.';
      const result = truncateSeoDescription(long);
      expect(result.length).toBeLessThanOrEqual(161);
      expect(result.endsWith('…')).toBe(true);
      expect(result).not.toMatch(/\s…$/);
      expect(long.startsWith(result.slice(0, -1))).toBe(true);
    });
  });

  describe('inferOgImageMimeType', () => {
    it('detects webp and jpeg', () => {
      expect(inferOgImageMimeType('https://cdn.example/a.webp')).toBe('image/webp');
      expect(inferOgImageMimeType('https://cdn.example/a.JPG?x=1')).toBe('image/jpeg');
    });
  });
});
