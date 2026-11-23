import type { PrivateProfile } from '../api/generated/models/private-profile';
import type { SessionUser } from '../services/session.service';

export function sessionUserFromPrivateProfile(profile: PrivateProfile): SessionUser {
  return {
    id: profile.id,
    email: profile.email,
    reputationScore: profile.reputationScore,
    firstName: profile.firstName,
    lastName: profile.lastName,
    postalCode: profile.postalCode,
    totalDonated: profile.totalDonated,
    totalReceived: profile.totalReceived,
    emailVerified: profile.emailVerified,
  };
}
