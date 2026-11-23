import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { ContactChannelFieldComponent } from '../contact-channel-field/contact-channel-field.component';
import { ItemSelectReceiverDialogComponent } from './item-select-receiver-dialog.component';

const selectI18n = {
  select_modal_title: 'Seleccionar receptor',
  select_modal_lead: 'El receptor verá tu canal.',
  select_channel_label: 'Canal de contacto',
  select_channel_type_whatsapp: 'WhatsApp',
  select_channel_type_phone: 'Teléfono',
  select_channel_type_telegram: 'Telegram',
  select_channel_type_email: 'Email',
  select_channel_placeholder_whatsapp: '+34 612 345 678',
  select_channel_placeholder_phone: '+34 900 000 000',
  select_channel_placeholder_telegram: 'tu_usuario',
  select_channel_placeholder_email: 'tu@email.com',
  select_channel_required: 'Introduce un canal de contacto.',
  select_legal_warning: 'Aviso legal',
  select_confirm: 'Confirmar selección',
  select_confirming: 'Confirmando…',
  select_cancel: 'Cancelar',
  select_score_points: 'puntos',
  days_today: 'hoy',
  days_yesterday: 'ayer',
  days_ago: 'hace {{days}}d',
  select_errors: { forbidden: 'Sin permiso' },
};

const esJson = {
  items: {
    explore: { distance_km: '{{km}} km' },
    my_objects: selectI18n,
  },
};

const candidate: RankedCandidate = {
  requestId: 'req-1',
  userId: 'user-a',
  firstName: 'Ana',
  lastName: 'García',
  reputationScore: 90,
  distanceMeters: 1000,
  locationName: null,
  requestDate: '2026-05-20T10:00:00Z',
};

describe('ItemSelectReceiverDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemSelectReceiverDialogComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  function create(): ComponentFixture<ItemSelectReceiverDialogComponent> {
    const fixture = TestBed.createComponent(ItemSelectReceiverDialogComponent);
    fixture.componentRef.setInput('candidate', candidate);
    fixture.detectChanges();
    return fixture;
  }

  it('renders dialog with ARIA when open', () => {
    const fixture = create();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Seleccionar receptor');
  });

  it('marks active channel pill with aria-pressed', () => {
    const fixture = create();
    const pills = fixture.nativeElement.querySelectorAll(
      '.contact-channel-field__type-pill',
    ) as NodeListOf<HTMLButtonElement>;
    expect(pills[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(pills[1]?.getAttribute('aria-pressed')).toBe('false');
    expect(pills[2]?.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows inline error when confirming with empty channel', () => {
    const fixture = create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    fixture.componentInstance.onConfirm();
    fixture.detectChanges();

    expect(confirmed).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Introduce un canal de contacto.',
    );
  });

  it('emits confirmed with built WhatsApp channel', () => {
    const fixture = create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    const field = fixture.debugElement.query(
      By.directive(ContactChannelFieldComponent),
    ).componentInstance as ContactChannelFieldComponent;
    field.form.controls.channelValue.setValue('+34 612 345 678');
    fixture.detectChanges();

    fixture.componentInstance.onConfirm();
    fixture.detectChanges();

    expect(confirmed).toHaveBeenCalledWith('WhatsApp: +34 612 345 678');
  });

  it('emits confirmed when submit button triggers form submit (no native reload)', () => {
    const fixture = create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    const field = fixture.debugElement.query(
      By.directive(ContactChannelFieldComponent),
    ).componentInstance as ContactChannelFieldComponent;
    field.form.controls.channelValue.setValue('+34 612 345 678');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const prevented = !form.dispatchEvent(submitEvent);
    fixture.detectChanges();

    expect(prevented).toBe(true);
    expect(confirmed).toHaveBeenCalledWith('WhatsApp: +34 612 345 678');
  });

  it('emits dismissed on Escape', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('does not emit dismissed on Escape while submitting', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(dismissed).not.toHaveBeenCalled();
  });

  it('shows API error when errorKey is set', () => {
    const fixture = create();
    fixture.componentRef.setInput(
      'errorKey',
      'items.my_objects.select_errors.forbidden',
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin permiso');
  });
});
