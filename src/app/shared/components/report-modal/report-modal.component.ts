import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import { RecaptchaService } from '../../../core/services/recaptcha.service';
import { ReportService, ReportContext, ReportReason } from '../../../core/services/report.service';

type ModalStep = 'STEP_1_REASON' | 'STEP_2_DESCRIPTION' | 'SUBMITTING' | 'STEP_3_CONFIRMATION';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ReasonOption {
  value: ReportReason;
  labelKey: string;
  subLabelKey?: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  { value: 'contenido_inadecuado', labelKey: 'reports.modal.reasons.contenido_inadecuado', subLabelKey: 'reports.modal.reasons.contenido_inadecuado_sub' },
  { value: 'fraude_o_enganio', labelKey: 'reports.modal.reasons.fraude_o_enganio', subLabelKey: 'reports.modal.reasons.fraude_o_enganio_sub' },
  { value: 'spam', labelKey: 'reports.modal.reasons.spam', subLabelKey: 'reports.modal.reasons.spam_sub' },
  { value: 'objeto_ilegal', labelKey: 'reports.modal.reasons.objeto_ilegal', subLabelKey: 'reports.modal.reasons.objeto_ilegal_sub' },
  { value: 'objeto_peligroso', labelKey: 'reports.modal.reasons.objeto_peligroso', subLabelKey: 'reports.modal.reasons.objeto_peligroso_sub' },
  { value: 'información_falsa', labelKey: 'reports.modal.reasons.información_falsa', subLabelKey: 'reports.modal.reasons.información_falsa_sub' },
  { value: 'comportamiento_abusivo', labelKey: 'reports.modal.reasons.comportamiento_abusivo', subLabelKey: 'reports.modal.reasons.comportamiento_abusivo_sub' },
  { value: 'otro', labelKey: 'reports.modal.reasons.otro' },
];

@Component({
  selector: 'app-report-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ReportModalComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportService = inject(ReportService);
  private readonly recaptchaService = inject(RecaptchaService);

  readonly context = input.required<ReportContext>();
  readonly closed = output<void>();
  readonly submitted = output<void>();

  readonly step = signal<ModalStep>('STEP_1_REASON');
  readonly selectedReason = signal<ReportReason | null>(null);
  readonly description = signal('');
  readonly errorKey = signal<string | null>(null);

  readonly charCount = computed(() => this.description().length);
  readonly isSubmitting = computed(() => this.step() === 'SUBMITTING');
  readonly reasonOptions = REASON_OPTIONS;

  readonly currentTitleId = computed(() => {
    const s = this.step();
    if (s === 'STEP_1_REASON') return 'report-modal-title-step1';
    if (s === 'STEP_2_DESCRIPTION' || s === 'SUBMITTING') return 'report-modal-title-step2';
    return 'report-modal-title-step3';
  });

  readonly selectedReasonLabelKey = computed(() => {
    const r = this.selectedReason();
    return r ? REASON_OPTIONS.find((o) => o.value === r)?.labelKey ?? '' : '';
  });

  private bodyOverflowBeforeLock: string | null = null;

  constructor() {
    afterNextRender(() => {
      this.lockBodyScroll();
      this.focusFirstInteractive();
    });
    this.destroyRef.onDestroy(() => this.unlockBodyScroll());
  }

  onSelectReason(reason: ReportReason): void {
    this.selectedReason.set(reason);
    this.errorKey.set(null);
  }

  onNext(): void {
    if (this.selectedReason() !== null) {
      this.step.set('STEP_2_DESCRIPTION');
      setTimeout(() => this.focusFirstInteractive());
    }
  }

  onBack(): void {
    this.step.set('STEP_1_REASON');
    this.errorKey.set(null);
    setTimeout(() => this.focusFirstInteractive());
  }

  onDescriptionInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.description.set(value.slice(0, 500));
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;
    const reason = this.selectedReason();
    if (!reason) return;

    this.step.set('SUBMITTING');
    this.errorKey.set(null);

    from(this.recaptchaService.execute('report'))
      .pipe(
        switchMap((token) =>
          this.reportService.submit(
            this.context(),
            reason,
            this.description() || null,
            token,
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.step.set('STEP_3_CONFIRMATION'),
        error: (err: unknown) => this.handleError(err),
      });
  }

  handleError(err: unknown): void {
    if (!(err instanceof HttpErrorResponse)) {
      this.step.set('STEP_2_DESCRIPTION');
      this.errorKey.set('reports.error.recaptcha_failed');
      setTimeout(() => this.focusFirstInteractive());
      return;
    }

    const code = (err.error as { code?: string } | null)?.code;

    if (code === 'SELF_REPORT_FORBIDDEN') {
      console.warn('SELF_REPORT_FORBIDDEN: el trigger no debería haberse mostrado');
      this.closed.emit();
      return;
    }

    this.step.set('STEP_2_DESCRIPTION');
    setTimeout(() => this.focusFirstInteractive());

    if (code === 'REPORT_ALREADY_PENDING') {
      this.errorKey.set('reports.error.already_pending');
      return;
    }
    if (code === 'ENTITY_NOT_REPORTABLE') {
      this.errorKey.set('reports.error.not_reportable');
      return;
    }
    if (code === 'RECAPTCHA_FAILED') {
      this.errorKey.set('reports.error.recaptcha_failed');
      return;
    }
    if (code === 'RATE_LIMIT_ENTITY_EXCEEDED') {
      this.errorKey.set('reports.error.rate_limit_entity');
      return;
    }
    if (code === 'RATE_LIMIT_TOTAL_EXCEEDED') {
      this.errorKey.set('reports.error.rate_limit_total');
      return;
    }
    this.errorKey.set('reports.error.generic');
  }

  onClose(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  onCloseFinal(): void {
    this.submitted.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const panel = this.elementRef.nativeElement.querySelector('.report-modal__panel');
    const focusable = Array.from(
      (panel as HTMLElement | null)?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
    ).filter((el): el is HTMLElement => el instanceof HTMLElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!panel?.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onReasonItemKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const list = this.elementRef.nativeElement.querySelector('.report-modal__reasons');
    const items = Array.from(
      (list as HTMLElement | null)?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
    if (!items.length) return;
    const targetIndex = event.key === 'ArrowDown'
      ? (index + 1) % items.length
      : (index - 1 + items.length) % items.length;
    items[targetIndex]?.focus();
  }

  onEscape(): void {
    this.onClose();
  }

  private focusFirstInteractive(): void {
    const panel = this.elementRef.nativeElement.querySelector('.report-modal__panel') as HTMLElement | null;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();
  }

  private lockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    this.bodyOverflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    if (this.bodyOverflowBeforeLock !== null) {
      document.body.style.overflow = this.bodyOverflowBeforeLock;
      this.bodyOverflowBeforeLock = null;
    } else {
      document.body.style.removeProperty('overflow');
    }
  }
}
