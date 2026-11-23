export type ContactChannelType = 'whatsapp' | 'phone' | 'telegram' | 'email';

export const CONTACT_CHANNEL_TYPES: readonly ContactChannelType[] = [
  'whatsapp',
  'phone',
  // 'telegram', // TODO: habilitar cuando esté disponible la integración con Telegram
  'email',
];

const CHANNEL_PREFIX: Record<ContactChannelType, string> = {
  whatsapp: 'WhatsApp: ',
  phone: 'Teléfono: ',
  telegram: 'Telegram: @',
  email: 'Email: ',
};

export function buildContactChannel(
  type: ContactChannelType,
  value: string,
): string {
  return CHANNEL_PREFIX[type] + value.trim();
}

export function parseContactChannel(
  channel: string,
): { type: ContactChannelType; value: string } {
  const trimmed = channel.trim();
  for (const type of CONTACT_CHANNEL_TYPES) {
    const prefix = CHANNEL_PREFIX[type];
    if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
      return { type, value: trimmed.slice(prefix.length).trim() };
    }
  }
  return { type: 'whatsapp', value: trimmed };
}

export function contactChannelUsesEmail(channel: string): boolean {
  return channel.trim().toLowerCase().startsWith('email:');
}

const PENDING_CONTACT_STORAGE_PREFIX = 'nlv-request-contact:';

export function readPendingRequestContact(itemId: string): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    return sessionStorage.getItem(PENDING_CONTACT_STORAGE_PREFIX + itemId);
  } catch {
    return null;
  }
}

export function writePendingRequestContact(
  itemId: string,
  contactChannel: string,
): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(
      PENDING_CONTACT_STORAGE_PREFIX + itemId,
      contactChannel,
    );
  } catch {
    // sessionStorage no disponible
  }
}
