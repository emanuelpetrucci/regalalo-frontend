import type { PrivateProfile } from '../api/generated/models/private-profile';
import { sessionUserFromPrivateProfile } from './session-user.util';

function mockProfile(overrides: Partial<PrivateProfile> = {}): PrivateProfile {
  return {
    avatarUrl: null,
    consecutiveNoShows: 0,
    createdAt: '2026-01-01T00:00:00Z',
    email: 'user@example.com',
    emailVerified: true,
    firstName: 'Ana',
    id: 'u1',
    lastName: 'García',
    phone: null,
    postalCode: '28001',
    preferredLanguage: 'es',
    reputationScore: 10,
    totalDonated: 1,
    totalReceived: 2,
    ...overrides,
  };
}

describe('sessionUserFromPrivateProfile', () => {
  it('maps emailVerified true from PrivateProfile', () => {
    const user = sessionUserFromPrivateProfile(mockProfile({ emailVerified: true }));

    expect(user.emailVerified).toBe(true);
    expect(user.id).toBe('u1');
    expect(user.email).toBe('user@example.com');
  });

  it('maps emailVerified false from PrivateProfile', () => {
    const user = sessionUserFromPrivateProfile(mockProfile({ emailVerified: false }));

    expect(user.emailVerified).toBe(false);
  });
});
