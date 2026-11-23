import { sanitizeReturnUrl } from './return-url.util';

describe('sanitizeReturnUrl', () => {
  it('accepts a valid internal path', () => {
    expect(sanitizeReturnUrl('/explorar')).toBe('/explorar');
  });

  it('accepts a path with query string', () => {
    expect(sanitizeReturnUrl('/explorar?q=test')).toBe('/explorar?q=test');
  });

  it('returns null for null input', () => {
    expect(sanitizeReturnUrl(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(sanitizeReturnUrl('')).toBeNull();
  });

  it('returns null for external https URL', () => {
    expect(sanitizeReturnUrl('https://evil.com')).toBeNull();
  });

  it('returns null for protocol-relative URL (//)', () => {
    expect(sanitizeReturnUrl('//evil.com')).toBeNull();
  });

  it('returns null for path without leading slash', () => {
    expect(sanitizeReturnUrl('explorar')).toBeNull();
  });

  it('returns null for /javascript: URI', () => {
    expect(sanitizeReturnUrl('/javascript:alert(1)')).toBeNull();
  });

  it('returns null for /vbscript: URI', () => {
    expect(sanitizeReturnUrl('/vbscript:msgbox(1)')).toBeNull();
  });

  it('returns null for /data: URI', () => {
    expect(sanitizeReturnUrl('/data:text/html,<script>alert(1)</script>')).toBeNull();
  });
});
