import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RequestContactBottomSheetComponent } from './request-contact-bottom-sheet.component';

const contactSheetI18n = {
  title: '¿Cómo puede contactarte el donante?',
  subtitle: 'Si te seleccionan, el donante usará este dato para coordinarse contigo.',
  cta_submit: 'Enviar solicitud',
  cta_cancel: 'Cancelar',
};

const contactChannelI18n = {
  label: 'Tu canal de contacto',
  placeholder: 'Ej: WhatsApp +34 600 000 000, Telegram @usuario...',
  hint: 'Puedes escribir lo que prefieras: número, usuario, app, etc.',
  error: {
    required: 'Introduce tu canal de contacto para continuar',
  },
};

const esJson = {
  items: {
    request: {
      contact_sheet: contactSheetI18n,
      contact_channel: contactChannelI18n,
      confirming: 'Enviando…',
    },
  },
};

describe('RequestContactBottomSheetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RequestContactBottomSheetComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  function create(open = true) {
    const fixture = TestBed.createComponent(RequestContactBottomSheetComponent);
    fixture.componentRef.setInput('open', open);
    fixture.detectChanges();
    return fixture;
  }

  function getInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '#contact-channel-input',
    ) as HTMLInputElement;
  }

  function getSubmitBtn(fixture: ReturnType<typeof create>): HTMLButtonElement {
    const btns = fixture.nativeElement.querySelectorAll(
      '.contact-sheet__footer app-btn button',
    ) as NodeListOf<HTMLButtonElement>;
    return btns[btns.length - 1];
  }

  function getCancelBtn(fixture: ReturnType<typeof create>): HTMLButtonElement {
    const btns = fixture.nativeElement.querySelectorAll(
      '.contact-sheet__footer app-btn button',
    ) as NodeListOf<HTMLButtonElement>;
    return btns[0];
  }

  it('renders dialog with ARIA when open (AC 1)', () => {
    const fixture = create(true);
    const dialog = fixture.nativeElement.querySelector(
      '[role="dialog"]',
    ) as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('¿Cómo puede contactarte el donante?');
  });

  it('does not render when closed', () => {
    const fixture = create(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('submit button is disabled when contactChannelValue is empty (AC 2)', () => {
    const fixture = create();
    const submitBtn = getSubmitBtn(fixture);
    expect(submitBtn.disabled).toBe(true);
  });

  it('submit button is enabled when contactChannelValue has value (AC 2)', () => {
    const fixture = create();
    const input = getInput(fixture);
    input.value = 'WhatsApp +34 600 000 000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = getSubmitBtn(fixture);
    expect(submitBtn.disabled).toBe(false);
  });

  it('emits confirmed with trimmed contactChannel on submit (AC 3)', () => {
    const fixture = create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    const input = getInput(fixture);
    input.value = '  @usuario  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    getSubmitBtn(fixture).click();
    fixture.detectChanges();

    expect(confirmed).toHaveBeenCalledWith('@usuario');
  });

  it('emits dismissed when Cancel is clicked (AC 6)', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    getCancelBtn(fixture).click();
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('emits dismissed when backdrop is clicked (AC 6)', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    const backdrop = fixture.nativeElement.querySelector(
      '.contact-sheet__backdrop',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('emits dismissed on Escape (AC 6)', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('does not emit dismissed on Escape when submitting', () => {
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

  it('shows inline error when fieldErrorKey has value (AC 4)', () => {
    const fixture = create();
    fixture.componentRef.setInput(
      'fieldErrorKey',
      'items.request.contact_channel.error.required',
    );
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('#contact-channel-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain(
      'Introduce tu canal de contacto para continuar',
    );
    const input = getInput(fixture);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('contact-channel-error');
  });

  it('does not show error element when fieldErrorKey is null (AC 4)', () => {
    const fixture = create();
    const errorEl = fixture.nativeElement.querySelector('#contact-channel-error');
    expect(errorEl).toBeNull();
    const input = getInput(fixture);
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toBe('contact-channel-hint');
  });

  it('does not emit dismissed from backdrop when submitting', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.contact-sheet__backdrop',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(dismissed).not.toHaveBeenCalled();
  });
});
