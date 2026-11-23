import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ItemCancelDialogComponent } from './item-cancel-dialog.component';

const cancelI18n = {
  dialog_title: 'Cancelar objeto',
  dialog_body: 'El objeto dejará de aparecer en el tablón.',
  dialog_title_with_session: 'Cancelar objeto y entrega',
  dialog_body_with_session: 'Se cancelará la entrega en curso.',
  confirm: 'Cancelar objeto',
  confirming: 'Cancelando…',
  dismiss: 'Volver',
  errors: { forbidden: 'No puedes cancelar este objeto' },
};

const esJson = { items: { cancel: cancelI18n } };

describe('ItemCancelDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemCancelDialogComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  function create(open = true) {
    const fixture = TestBed.createComponent(ItemCancelDialogComponent);
    fixture.componentRef.setInput('open', open);
    fixture.detectChanges();
    return fixture;
  }

  it('renders dialog with ARIA when open (AC 5)', () => {
    const fixture = create(true);
    const dialog = fixture.nativeElement.querySelector(
      '[role="dialog"]',
    ) as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Cancelar objeto');
  });

  it('does not render when closed', () => {
    const fixture = create(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('emits confirmed on confirm click (AC 1)', () => {
    const fixture = create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    const buttons = fixture.nativeElement.querySelectorAll(
      'app-btn button',
    ) as NodeListOf<HTMLButtonElement>;
    const confirmBtn = [...buttons].find((b) =>
      b.textContent?.includes('Cancelar objeto'),
    );
    confirmBtn?.click();
    fixture.detectChanges();

    expect(confirmed).toHaveBeenCalled();
  });

  it('emits dismissed on dismiss click (AC 5)', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    const buttons = fixture.nativeElement.querySelectorAll(
      'app-btn button',
    ) as NodeListOf<HTMLButtonElement>;
    const dismissBtn = [...buttons].find((b) => b.textContent?.includes('Volver'));
    dismissBtn?.click();
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('emits dismissed on Escape (AC 5)', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(dismissed).toHaveBeenCalled();
  });

  it('does not emit dismissed on Escape when cancelling', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('cancelling', true);
    fixture.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(dismissed).not.toHaveBeenCalled();
  });

  it('does not emit dismissed on backdrop click when cancelling', () => {
    const fixture = create();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('cancelling', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.cancel-dialog__backdrop',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(dismissed).not.toHaveBeenCalled();
  });

  it('shows item title when itemTitle input is set', () => {
    const fixture = create();
    fixture.componentRef.setInput('itemTitle', 'Mesa de roble');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Mesa de roble');
  });

  it('wraps Tab focus from last button to first', () => {
    const fixture = create();
    const dialog = fixture.nativeElement.querySelector(
      '.cancel-dialog__panel',
    ) as HTMLElement;
    const buttons = dialog.querySelectorAll('app-btn button');
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;
    const focusSpy = vi.spyOn(first, 'focus');
    const activeSpy = vi.spyOn(document, 'activeElement', 'get').mockReturnValue(
      last,
    );
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    fixture.componentInstance.onPanelKeydown(event);

    activeSpy.mockRestore();
    expect(preventSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('shows error message when errorKey is set (AC 4)', () => {
    const fixture = create();
    fixture.componentRef.setInput('errorKey', 'items.cancel.errors.forbidden');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No puedes cancelar este objeto',
    );
  });

  it('renders with_session copy when hasActiveDeliverySession is true (AC 2)', () => {
    const fixture = create();
    fixture.componentRef.setInput('hasActiveDeliverySession', true);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Cancelar objeto y entrega');
    expect(text).toContain('Se cancelará la entrega en curso.');
    expect(text).not.toContain('El objeto dejará de aparecer en el tablón.');
  });

  it('renders default body when hasActiveDeliverySession is false (AC 3)', () => {
    const fixture = create();
    fixture.componentRef.setInput('hasActiveDeliverySession', false);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('El objeto dejará de aparecer en el tablón.');
    expect(text).not.toContain('Se cancelará la entrega en curso.');
  });
});
