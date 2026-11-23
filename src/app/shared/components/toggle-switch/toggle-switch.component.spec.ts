import { TestBed } from '@angular/core/testing';
import { ToggleSwitchComponent } from './toggle-switch.component';

describe('ToggleSwitchComponent', () => {
  function createComponent(
    checked = false,
    disabled = false,
    ariaLabel = 'Toggle',
  ) {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('checked', checked);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.componentRef.setInput('ariaLabel', ariaLabel);
    fixture.detectChanges();
    return fixture;
  }

  it('renders with role="switch"', () => {
    const fixture = createComponent();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('role')).toBe('switch');
  });

  it('sets aria-checked to false when unchecked', () => {
    const fixture = createComponent(false);
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('sets aria-checked to true when checked', () => {
    const fixture = createComponent(true);
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('applies --checked class when checked', () => {
    const fixture = createComponent(true);
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList).toContain('toggle-switch--checked');
  });

  it('emits true on click when unchecked', () => {
    const fixture = createComponent(false);
    const emitted: boolean[] = [];
    fixture.componentInstance.checkedChange.subscribe((v: boolean) => emitted.push(v));
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toEqual([true]);
  });

  it('emits false on click when checked', () => {
    const fixture = createComponent(true);
    const emitted: boolean[] = [];
    fixture.componentInstance.checkedChange.subscribe((v: boolean) => emitted.push(v));
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toEqual([false]);
  });

  it('does not emit when disabled', () => {
    const fixture = createComponent(false, true);
    const emitted: boolean[] = [];
    fixture.componentInstance.checkedChange.subscribe((v: boolean) => emitted.push(v));
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toEqual([]);
  });

  it('sets aria-label', () => {
    const fixture = createComponent(false, false, 'Pausar solicitudes');
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-label')).toBe('Pausar solicitudes');
  });

  it('sets disabled attribute when disabled', () => {
    const fixture = createComponent(false, true);
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBeTruthy();
  });
});
