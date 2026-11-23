import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import { buildProfilePatchBody } from './profile-patch.util';

const baseProfile: PrivateProfile = {
  id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
  email: 'user@example.com',
  firstName: 'Ana',
  lastName: 'García',
  phone: '+34600111222',
  avatarUrl: 'https://example.com/a.jpg',
  emailVerified: true,
  preferredLanguage: 'es',
  postalCode: '28001',
  reputationScore: 0,
  totalReceived: 0,
  totalDonated: 0,
  consecutiveNoShows: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const baseForm = {
  firstName: 'Ana',
  lastName: 'García',
  avatarUrl: 'https://example.com/a.jpg',
  phone: '+34600111222',
  postalCode: '28001',
  preferredLanguage: 'es',
};

describe('buildProfilePatchBody', () => {
  it('returns empty body when nothing changed', () => {
    const body = buildProfilePatchBody(
      {
        firstName: 'Ana',
        lastName: 'García',
        avatarUrl: 'https://example.com/a.jpg',
        phone: '+34600111222',
        postalCode: '28001',
        preferredLanguage: 'es',
      },
      baseProfile,
    );
    expect(body).toEqual({});
  });

  it('does not include postalCode when unchanged', () => {
    const body = buildProfilePatchBody(
      {
        firstName: 'Ana María',
        lastName: 'García',
        avatarUrl: 'https://example.com/a.jpg',
        phone: '+34600111222',
        postalCode: '28001',
        preferredLanguage: 'es',
      },
      baseProfile,
    );
    expect(body.postalCode).toBeUndefined();
    expect(body.firstName).toBe('Ana María');
  });

  it('includes preferredLanguage when changed to ca', () => {
    const body = buildProfilePatchBody(
      { ...baseForm, preferredLanguage: 'ca' },
      { ...baseProfile, preferredLanguage: 'es' },
    );
    expect(body).toEqual({ preferredLanguage: 'ca' });
  });

  it('normalizes preferredLanguage case before compare', () => {
    const body = buildProfilePatchBody(
      { ...baseForm, preferredLanguage: 'CA' },
      { ...baseProfile, preferredLanguage: 'ca' },
    );
    expect(body).toEqual({});
  });

  it('includes postalCode only when changed', () => {
    const body = buildProfilePatchBody(
      {
        firstName: 'Ana',
        lastName: 'García',
        avatarUrl: 'https://example.com/a.jpg',
        phone: '+34600111222',
        postalCode: '08001',
        preferredLanguage: 'es',
      },
      baseProfile,
    );
    expect(body.postalCode).toBe('08001');
    expect(Object.keys(body)).toEqual(['postalCode']);
  });

  it('sends null phone when cleared', () => {
    const body = buildProfilePatchBody(
      {
        firstName: 'Ana',
        lastName: 'García',
        avatarUrl: 'https://example.com/a.jpg',
        phone: '',
        postalCode: '28001',
        preferredLanguage: 'es',
      },
      baseProfile,
    );
    expect(body.phone).toBeNull();
  });

  it('sends null avatarUrl when cleared', () => {
    const body = buildProfilePatchBody(
      {
        firstName: 'Ana',
        lastName: 'García',
        avatarUrl: '',
        phone: '+34600111222',
        postalCode: '28001',
        preferredLanguage: 'es',
      },
      baseProfile,
    );
    expect(body.avatarUrl).toBeNull();
  });
});
