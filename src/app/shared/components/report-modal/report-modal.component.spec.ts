import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportModalComponent } from './report-modal.component';
import { ReportService, ReportContext } from '../../../core/services/report.service';
import { RecaptchaService } from '../../../core/services/recaptcha.service';

/* ── i18n mínimo necesario para los tests ──────────────────────── */
const esJson = {
  reports: {
    modal: {
      title_item: 'Reportar objeto',
      title_user: 'Reportar usuario',
      step1: { instruction: '¿Qué tipo de problema quieres reportar?' },
      step2: {
        title: 'Añade contexto (opcional)',
        reason_label: 'Motivo seleccionado',
        reason_change: 'Cambiar',
        textarea_label: 'Descripción adicional',
        textarea_optional: 'opcional',
        textarea_placeholder: 'Añade cualquier detalle...',
        privacy_note: 'Tu identidad no será revelada.',
      },
      step3: {
        title: 'Reporte enviado',
        body: 'Hemos recibido tu reporte.',
      },
      btn: {
        next: 'Siguiente',
        back: 'Atrás',
        cancel: 'Cancelar',
        submit: 'Enviar reporte',
        submitting: 'Enviando...',
        close: 'Cerrar',
      },
      reasons: {
        contenido_inadecuado: 'Contenido inadecuado u ofensivo',
        contenido_inadecuado_sub: 'Imágenes o texto que no son apropiados',
        fraude_o_enganio: 'Fraude o engaño',
        fraude_o_enganio_sub: 'El objeto no existe...',
        spam: 'Spam o publicidad',
        spam_sub: 'Publicación con fines comerciales',
        objeto_ilegal: 'Objeto ilegal',
        objeto_ilegal_sub: 'Producto prohibido',
        objeto_peligroso: 'Objeto peligroso',
        objeto_peligroso_sub: 'Puede causar daños físicos',
        información_falsa: 'Información falsa o engañosa',
        información_falsa_sub: 'Datos incorrectos',
        comportamiento_abusivo: 'Comportamiento abusivo',
        comportamiento_abusivo_sub: 'Mensajes, acoso u hostigamiento',
        otro: 'Otro motivo',
      },
    },
    error: {
      already_pending: 'Ya tienes un reporte pendiente.',
      not_reportable: 'Este contenido no puede ser reportado.',
      recaptcha_failed: 'No hemos podido verificar tu solicitud.',
      rate_limit_entity: 'Has enviado demasiados reportes.',
      rate_limit_total: 'Has alcanzado el límite de reportes.',
      generic: 'Ha ocurrido un error inesperado.',
    },
  },
};

/* ── helpers ──────────────────────────────────────────────────── */
const defaultContext: ReportContext = {
  entityType: 'item',
  entityId: 'item-uuid',
  entityDisplayName: 'Sofá de tres plazas',
};

function makeHttpError(status: number, code?: string): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    error: code ? { code } : null,
  });
}

describe('ReportModalComponent', () => {
  let reportServiceSpy: { submit: ReturnType<typeof vi.fn> };
  let recaptchaServiceSpy: { execute: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    reportServiceSpy = { submit: vi.fn().mockReturnValue(of({ id: 'uuid', message: 'ok' })) };
    recaptchaServiceSpy = { execute: vi.fn().mockResolvedValue('mock-token') };

    await TestBed.configureTestingModule({
      imports: [
        ReportModalComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: RecaptchaService, useValue: recaptchaServiceSpy },
      ],
    }).compileComponents();
  });

  function create(ctx: ReportContext = defaultContext) {
    const fixture = TestBed.createComponent(ReportModalComponent);
    fixture.componentRef.setInput('context', ctx);
    fixture.detectChanges();
    return fixture;
  }

  /* ── renderizado base ──────────────────────────────────────── */

  it('renderiza el dialog con ARIA en Paso 1', () => {
    const fixture = create();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Reportar objeto');
  });

  it('muestra "Reportar usuario" cuando entityType es user', () => {
    const fixture = create({ ...defaultContext, entityType: 'user' });
    expect(fixture.nativeElement.textContent).toContain('Reportar usuario');
  });

  it('muestra el entityDisplayName en el subtítulo del Paso 1', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain('Sofá de tres plazas');
  });

  /* ── AC-REP-FE-06: Siguiente deshabilitado sin motivo ───────── */

  it('AC-REP-FE-06: botón Siguiente está deshabilitado sin selección', () => {
    const fixture = create();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const nextBtn = [...buttons].find((b) => b.textContent?.trim() === 'Siguiente');
    expect(nextBtn).toBeTruthy();
    expect(nextBtn!.disabled).toBe(true);
  });

  it('AC-REP-FE-06: botón Siguiente se activa al seleccionar un motivo', () => {
    const fixture = create();
    const reasons = fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
    reasons[0].click();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const nextBtn = [...buttons].find((b) => b.textContent?.trim() === 'Siguiente');
    expect(nextBtn!.disabled).toBe(false);
  });

  /* ── AC-REP-FE-15: Atrás mantiene selección ─────────────────── */

  it('AC-REP-FE-15: Atrás regresa al Paso 1 manteniendo la selección de motivo', () => {
    const fixture = create();
    const reasons = fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
    reasons[2].click(); // spam
    fixture.detectChanges();

    fixture.componentInstance.onNext();
    fixture.detectChanges();

    // estamos en paso 2
    expect(fixture.nativeElement.textContent).toContain('Añade contexto (opcional)');
    expect(fixture.componentInstance['selectedReason']()).toBe('spam');

    fixture.componentInstance.onBack();
    fixture.detectChanges();

    // de vuelta en paso 1 con spam seleccionado
    const selectedItem = fixture.nativeElement.querySelector('.report-modal__reason-item--selected');
    expect(selectedItem).toBeTruthy();
    expect(fixture.componentInstance['selectedReason']()).toBe('spam');
  });

  /* ── AC-REP-FE-07: Contador de caracteres y límite 500 ──────── */

  it('AC-REP-FE-07: el textarea acepta hasta 500 caracteres y el contador refleja el conteo', () => {
    const fixture = create();
    // Avanzar al paso 2
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();

    // Simular escritura de 510 caracteres
    const longText = 'a'.repeat(510);
    Object.defineProperty(textarea, 'value', { value: longText, writable: true });
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // La señal debe truncar a 500
    expect(fixture.componentInstance['description']()).toHaveLength(500);
    expect(fixture.componentInstance['charCount']()).toBe(500);
    expect(fixture.nativeElement.textContent).toContain('500 / 500');
  });

  /* ── AC-REP-FE-08: Estado SUBMITTING ────────────────────────── */

  it('AC-REP-FE-08: botón Enviar se deshabilita durante SUBMITTING', async () => {
    // Hacer que el submit no resuelva inmediatamente
    let resolveSubmit!: (v: unknown) => void;
    reportServiceSpy.submit.mockReturnValue(
      new Promise((resolve) => { resolveSubmit = resolve; })
    );

    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    // Esperar a que Promise de recaptcha se resuelva
    await Promise.resolve();
    fixture.detectChanges();

    // En estado SUBMITTING el botón debe estar disabled
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const submitBtn = [...buttons].find((b) => b.textContent?.includes('Enviando'));
    expect(submitBtn?.disabled).toBe(true);

    // El textarea debe ser readonly
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea?.hasAttribute('readonly')).toBe(true);

    // Limpiar
    resolveSubmit({ id: 'x', message: 'ok' });
  });

  /* ── AC-REP-FE-09: Submit exitoso → Paso 3 ──────────────────── */

  it('AC-REP-FE-09: submit exitoso muestra Paso 3 con título de confirmación', async () => {
    reportServiceSpy.submit.mockReturnValue(of({ id: 'uuid', message: 'ok' }));
    recaptchaServiceSpy.execute.mockResolvedValue('token');

    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0)); // flush promises
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Reporte enviado');
    expect(fixture.nativeElement.textContent).toContain('Hemos recibido tu reporte.');
  });

  /* ── AC-REP-FE-10: submitted emitido desde Paso 3 ───────────── */

  it('AC-REP-FE-10: emite submitted al cerrar desde el Paso 3', async () => {
    reportServiceSpy.submit.mockReturnValue(of({ id: 'uuid', message: 'ok' }));

    const fixture = create();
    const submittedSpy = vi.fn();
    fixture.componentInstance.submitted.subscribe(submittedSpy);

    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    // Estamos en Paso 3 — botón Cerrar
    const closeBtn = [...(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)]
      .find((b) => b.textContent?.trim() === 'Cerrar');
    closeBtn?.click();
    fixture.detectChanges();

    expect(submittedSpy).toHaveBeenCalled();
  });

  /* ── AC-REP-FE-11: Error inline en Paso 2 ───────────────────── */

  it('AC-REP-FE-11: muestra el error inline en la zona de error del Paso 2', async () => {
    recaptchaServiceSpy.execute.mockResolvedValue('token');
    reportServiceSpy.submit.mockReturnValue(throwError(() => makeHttpError(409, 'REPORT_ALREADY_PENDING')));

    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    // Debe mostrar error inline (no toast)
    const errorZone = fixture.nativeElement.querySelector('.report-modal__error-zone');
    expect(errorZone).toBeTruthy();
    expect(errorZone.textContent).toContain('Ya tienes un reporte pendiente.');

    // Seguimos en paso 2
    expect(fixture.nativeElement.textContent).toContain('Añade contexto (opcional)');
  });

  /* ── AC-REP-FE-12: Contenido textarea conservado tras error ──── */

  it('AC-REP-FE-12: tras error, textarea conserva su contenido y botón se reactiva', async () => {
    recaptchaServiceSpy.execute.mockResolvedValue('token');
    reportServiceSpy.submit.mockReturnValue(throwError(() => makeHttpError(429, 'RATE_LIMIT_TOTAL_EXCEEDED')));

    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance['description'].set('Texto del usuario');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    // Contenido conservado
    expect(fixture.componentInstance['description']()).toBe('Texto del usuario');

    // Botón Enviar reactivo (no disabled)
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const submitBtn = [...buttons].find((b) => b.textContent?.includes('Enviar reporte'));
    expect(submitBtn?.disabled).toBe(false);
  });

  /* ── AC-REP-FE-13: reCAPTCHA con acción 'report' ────────────── */

  it('AC-REP-FE-13: obtiene token reCAPTCHA con acción "report"', async () => {
    reportServiceSpy.submit.mockReturnValue(of({ id: 'uuid', message: 'ok' }));

    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));

    expect(recaptchaServiceSpy.execute).toHaveBeenCalledWith('report');
  });

  /* ── AC-REP-FE-19: Handler lee error.error.code ──────────────── */

  it('AC-REP-FE-19: distingue VALIDATION_ERROR y RECAPTCHA_FAILED bajo el mismo status 400', async () => {
    const fixture = create();
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    // Caso 1: RECAPTCHA_FAILED
    recaptchaServiceSpy.execute.mockResolvedValue('token');
    reportServiceSpy.submit.mockReturnValue(throwError(() => makeHttpError(400, 'RECAPTCHA_FAILED')));
    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const errorZone1 = fixture.nativeElement.querySelector('.report-modal__error-zone');
    expect(errorZone1?.textContent).toContain('No hemos podido verificar tu solicitud.');

    // Caso 2: VALIDATION_ERROR → mensaje genérico
    reportServiceSpy.submit.mockReturnValue(throwError(() => makeHttpError(400, 'VALIDATION_ERROR')));
    fixture.componentInstance.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    const errorZone2 = fixture.nativeElement.querySelector('.report-modal__error-zone');
    expect(errorZone2?.textContent).toContain('Ha ocurrido un error inesperado.');
  });

  /* ── Accessibility: ESC cierra modal ────────────────────────── */

  it('emite closed al pulsar ESC (AC-REP-FE-17)', () => {
    const fixture = create();
    const closedSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closedSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('no emite closed al pulsar ESC durante SUBMITTING (AC-REP-FE-08)', () => {
    const fixture = create();
    const closedSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closedSpy);

    // Forzar estado SUBMITTING
    fixture.componentInstance['step'].set('SUBMITTING');
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(closedSpy).not.toHaveBeenCalled();
  });

  /* ── ARIA: aria-labelledby cambia por paso ───────────────────── */

  it('actualiza aria-labelledby según el paso activo', () => {
    const fixture = create();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;

    // Paso 1
    expect(dialog.getAttribute('aria-labelledby')).toBe('report-modal-title-step1');

    // Avanzar a Paso 2
    fixture.componentInstance.onSelectReason('spam');
    fixture.componentInstance.onNext();
    fixture.detectChanges();

    expect(dialog.getAttribute('aria-labelledby')).toBe('report-modal-title-step2');
  });
});
