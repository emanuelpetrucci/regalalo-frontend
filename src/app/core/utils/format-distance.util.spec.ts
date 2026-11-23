import { describe, expect, it } from 'vitest';
import { formatDistanceKm } from './format-distance.util';

describe('formatDistanceKm', () => {
  it('formats sub-10 km with one decimal when needed', () => {
    expect(formatDistanceKm(500)).toBe('0.5');
    expect(formatDistanceKm(5000)).toBe('5');
  });

  it('rounds longer distances to whole km', () => {
    expect(formatDistanceKm(12500)).toBe('13');
    expect(formatDistanceKm(49900)).toBe('50');
  });

  it('returns em dash for non-finite or negative meters', () => {
    expect(formatDistanceKm(Number.NaN)).toBe('—');
    expect(formatDistanceKm(-1)).toBe('—');
  });
});
