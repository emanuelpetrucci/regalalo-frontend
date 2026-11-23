import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ItemCategoryChipComponent } from './item-category-chip.component';

const esJson = {
  items: {
    category: {
      furniture: 'Muebles',
      electronics: 'Electrónica',
    },
  },
};

describe('ItemCategoryChipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemCategoryChipComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  it('renders translated category label via itemCategoryLabelKey', () => {
    const fixture = TestBed.createComponent(ItemCategoryChipComponent);
    fixture.componentRef.setInput('category', 'furniture');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Muebles');
    expect(el.querySelector('.item-category-chip--large')).toBeTruthy();
  });

  it('maps electronics enum to items.category.electronics', () => {
    const fixture = TestBed.createComponent(ItemCategoryChipComponent);
    fixture.componentRef.setInput('category', 'electronics');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent?.trim()).toBe('Electrónica');
  });
});
