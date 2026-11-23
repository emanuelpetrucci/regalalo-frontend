import { describe, expect, it } from 'vitest';
import { displayNameFromParts, initialsFromName } from './user-display.util';

describe('displayNameFromParts', () => {
  it('joins first and last name with a single space', () => {
    expect(displayNameFromParts('María', 'García')).toBe('María García');
    expect(displayNameFromParts('John', 'Doe')).toBe('John Doe');
  });

  it('trims whitespace around each part', () => {
    expect(displayNameFromParts('  Ana  ', '  López  ')).toBe('Ana López');
  });

  it('returns empty string when both parts are empty or whitespace', () => {
    expect(displayNameFromParts('', '')).toBe('');
    expect(displayNameFromParts('   ', '')).toBe('');
    expect(displayNameFromParts('', '   ')).toBe('');
  });

  it('returns only the non-empty part when one is missing', () => {
    expect(displayNameFromParts('María', '')).toBe('María');
    expect(displayNameFromParts('', 'García')).toBe('García');
  });

  it('handles unicode names', () => {
    expect(displayNameFromParts('Ñoño', 'Über')).toBe('Ñoño Über');
  });
});

describe('initialsFromName', () => {
  it('returns uppercase first letters for valid pairs', () => {
    expect(initialsFromName('María', 'García')).toBe('MG');
    expect(initialsFromName('john', 'doe')).toBe('JD');
  });

  it('trims whitespace before extracting initials', () => {
    expect(initialsFromName('  Ana  ', '  López  ')).toBe('AL');
  });

  it('returns empty string when first or last name is missing', () => {
    expect(initialsFromName('', 'García')).toBe('');
    expect(initialsFromName('María', '')).toBe('');
    expect(initialsFromName('   ', 'García')).toBe('');
    expect(initialsFromName('María', '   ')).toBe('');
  });

  it('uses only the first character of each field (multi-word names)', () => {
    expect(initialsFromName('María José', 'García López')).toBe('MG');
  });

  it('handles unicode letters', () => {
    expect(initialsFromName('Ñoño', 'Über')).toBe('ÑÜ');
  });
});
