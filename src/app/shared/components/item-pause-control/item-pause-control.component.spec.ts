import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { ItemPauseControlComponent } from './item-pause-control.component';

const ITEM_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

const esJson = {
  items: {
    pause: {
      title: 'Pausar solicitudes',
      subtitle_active: 'Aceptando nuevas solicitudes',
      subtitle_paused: 'No se admiten nuevas solicitudes',
      banner_paused: 'Las solicitudes están pausadas.',
      errors: {
        forbidden: 'No puedes cambiar la pausa',
        not_found: 'El objeto ya no está disponible',
        not_active: 'Solo puedes pausar objetos activos',
        generic: 'No se pudo actualizar la pausa.',
        connection: 'Error de conexión.',
      },
    },
  },
};

describe('ItemPauseControlComponent', () => {
  let itemsIdPausePatch: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    itemsIdPausePatch = vi.fn();

    await TestBed.configureTestingModule({
      imports: [
        ItemPauseControlComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: ItemsService, useValue: { itemsIdPausePatch } },
      ],
    }).compileComponents();
  });

  function createComponent(requestsPaused = false, disabled = false) {
    const fixture = TestBed.createComponent(ItemPauseControlComponent);
    fixture.componentRef.setInput('itemId', ITEM_ID);
    fixture.componentRef.setInput('requestsPaused', requestsPaused);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the toggle switch', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('app-toggle-switch')).toBeTruthy();
  });

  it('shows subtitle_active when not paused', () => {
    const fixture = createComponent(false);
    expect(fixture.nativeElement.textContent).toContain('Aceptando nuevas solicitudes');
  });

  it('shows subtitle_paused when paused', () => {
    const fixture = createComponent(true);
    expect(fixture.nativeElement.textContent).toContain('No se admiten nuevas solicitudes');
  });

  it('shows banner when paused', () => {
    const fixture = createComponent(true);
    expect(fixture.nativeElement.querySelector('.item-pause-control__banner')).toBeTruthy();
  });

  it('hides banner when not paused', () => {
    const fixture = createComponent(false);
    expect(fixture.nativeElement.querySelector('.item-pause-control__banner')).toBeNull();
  });

  it('calls itemsIdPausePatch with paused:true on toggle (success 12.1)', async () => {
    itemsIdPausePatch.mockResolvedValue({ requestsPaused: true });
    const fixture = createComponent(false);
    const emitted: boolean[] = [];
    fixture.componentInstance.pausedChange.subscribe((v: boolean) => emitted.push(v));

    void fixture.componentInstance.onToggle(true);
    await fixture.whenStable();

    expect(itemsIdPausePatch).toHaveBeenCalledWith({
      id: ITEM_ID,
      body: { paused: true },
    });
    expect(emitted).toEqual([true]);
  });

  it('calls itemsIdPausePatch with paused:false on toggle (success 12.2)', async () => {
    itemsIdPausePatch.mockResolvedValue({ requestsPaused: false });
    const fixture = createComponent(true);
    const emitted: boolean[] = [];
    fixture.componentInstance.pausedChange.subscribe((v: boolean) => emitted.push(v));

    void fixture.componentInstance.onToggle(false);
    await fixture.whenStable();

    expect(emitted).toEqual([false]);
  });

  it('shows forbidden error on 403 and does not emit', async () => {
    itemsIdPausePatch.mockRejectedValue(new HttpErrorResponse({ status: 403 }));
    const fixture = createComponent(false);
    const emitted: boolean[] = [];
    fixture.componentInstance.pausedChange.subscribe((v: boolean) => emitted.push(v));

    void fixture.componentInstance.onToggle(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance.errorKey()).toBe('items.pause.errors.forbidden');
  });

  it('shows not_active error on 409 and does not emit', async () => {
    itemsIdPausePatch.mockRejectedValue(new HttpErrorResponse({ status: 409 }));
    const fixture = createComponent(false);

    void fixture.componentInstance.onToggle(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.errorKey()).toBe('items.pause.errors.not_active');
  });

  it('resets pausing to false after success', async () => {
    itemsIdPausePatch.mockResolvedValue({ requestsPaused: true });
    const fixture = createComponent(false);

    void fixture.componentInstance.onToggle(true);
    await fixture.whenStable();

    expect(fixture.componentInstance.pausing()).toBeFalsy();
  });

  it('resets pausing to false after error', async () => {
    itemsIdPausePatch.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const fixture = createComponent(false);

    void fixture.componentInstance.onToggle(true);
    await fixture.whenStable();

    expect(fixture.componentInstance.pausing()).toBeFalsy();
  });
});
