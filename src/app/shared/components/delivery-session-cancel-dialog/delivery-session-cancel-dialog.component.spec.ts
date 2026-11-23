import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { DeliverySessionCancelDialogComponent } from './delivery-session-cancel-dialog.component';

const esJson = {
  items: {
    my_objects: {
      cancel_session: {
        title: 'Cancelar sesión',
        body: 'Cuerpo',
        no_show_title: 'El receptor no se presentó',
        no_show_body: 'Indica que no vino a recoger el objeto. Su reputación bajará.',
        no_show_confirm: 'Confirmar ausencia y cancelar',
        dismiss: 'Volver',
        confirm: 'Cancelar sesión',
        confirming: 'Cancelando…',
      },
    },
  },
};

describe('DeliverySessionCancelDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DeliverySessionCancelDialogComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  it('emits noShow false when confirming without checkbox', () => {
    const fixture = TestBed.createComponent(DeliverySessionCancelDialogComponent);
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.detectChanges();

    const confirmBtn = [
      ...fixture.nativeElement.querySelectorAll('app-btn'),
    ].find((el: HTMLElement) => el.textContent?.includes('Cancelar sesión'));
    (confirmBtn as HTMLElement).click();

    expect(confirmed).toHaveBeenCalledWith(false);
  });

  it('emits noShow true when checkbox is checked and user confirms', () => {
    const fixture = TestBed.createComponent(DeliverySessionCancelDialogComponent);
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    const confirmBtn = [
      ...fixture.nativeElement.querySelectorAll('app-btn'),
    ].find((el: HTMLElement) =>
      el.textContent?.includes('Confirmar ausencia y cancelar'),
    );
    (confirmBtn as HTMLElement).click();

    expect(confirmed).toHaveBeenCalledWith(true);
  });

  it('updates confirm label when checkbox is toggled', () => {
    const fixture = TestBed.createComponent(DeliverySessionCancelDialogComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cancelar sesión');
    expect(fixture.nativeElement.textContent).not.toContain(
      'Confirmar ausencia y cancelar',
    );

    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Confirmar ausencia y cancelar',
    );
  });
});
