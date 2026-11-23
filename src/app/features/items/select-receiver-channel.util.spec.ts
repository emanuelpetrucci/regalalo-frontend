import { buildContactChannel } from './select-receiver-channel.util';

describe('buildContactChannel', () => {
  it('prefixes WhatsApp channel', () => {
    expect(buildContactChannel('whatsapp', ' 612345678 ')).toBe(
      'WhatsApp: 612345678',
    );
  });

  it('prefixes Email channel', () => {
    expect(buildContactChannel('email', 'a@b.com')).toBe('Email: a@b.com');
  });

  it('prefixes Teléfono channel', () => {
    expect(buildContactChannel('phone', '+34 900 000 000')).toBe(
      'Teléfono: +34 900 000 000',
    );
  });

  it('prefixes Telegram channel with @', () => {
    expect(buildContactChannel('telegram', 'mi_usuario')).toBe(
      'Telegram: @mi_usuario',
    );
  });
});
