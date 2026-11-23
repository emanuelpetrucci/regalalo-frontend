import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import type { UpdateProfileRequest } from '../../../core/api/generated/models/update-profile-request';

export interface SettingsFormSnapshot {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phone: string;
  postalCode: string;
  preferredLanguage: string;
}

/** Solo incluye propiedades modificadas; nunca postalCode si no cambió. */
export function buildProfilePatchBody(
  form: SettingsFormSnapshot,
  original: PrivateProfile,
): UpdateProfileRequest {
  const body: UpdateProfileRequest = {};

  if (form.firstName !== original.firstName) {
    body.firstName = form.firstName;
  }
  if (form.lastName !== original.lastName) {
    body.lastName = form.lastName;
  }

  const formPhone = form.phone.trim();
  const origPhone = original.phone?.trim() ?? '';
  if (formPhone !== origPhone) {
    body.phone = formPhone === '' ? null : formPhone;
  }

  const formAvatar = form.avatarUrl.trim();
  const origAvatar = original.avatarUrl?.trim() ?? '';
  if (formAvatar !== origAvatar) {
    body.avatarUrl = formAvatar === '' ? null : formAvatar;
  }

  if (form.postalCode !== original.postalCode) {
    body.postalCode = form.postalCode;
  }

  const formLang = form.preferredLanguage.trim().toLowerCase();
  const origLang = original.preferredLanguage.trim().toLowerCase();
  if (formLang !== origLang) {
    body.preferredLanguage = formLang as UpdateProfileRequest['preferredLanguage'];
  }

  return body;
}
