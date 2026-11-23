import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ItemImageGalleryComponent } from './item-image-gallery.component';

const esJson = {
  items: {
    detail: {
      photo_of: 'Foto {{current}} de {{total}}',
      gallery_prev: 'Anterior',
      gallery_next: 'Siguiente',
      gallery_thumbs: 'Miniaturas',
      gallery_thumb: 'Foto {{n}}',
    },
    explore: { image_alt: 'Foto de {{title}}' },
  },
};

describe('ItemImageGalleryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemImageGalleryComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  it('updates counter when selecting thumbnail (AC 8)', () => {
    const fixture = TestBed.createComponent(ItemImageGalleryComponent);
    fixture.componentRef.setInput('images', [
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ]);
    fixture.componentRef.setInput('title', 'Mesa');
    fixture.detectChanges();

    const thumbs = fixture.nativeElement.querySelectorAll(
      '.gallery__thumb',
    ) as NodeListOf<HTMLButtonElement>;
    expect(thumbs.length).toBe(2);
    thumbs[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIndex()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Foto 2 de 2');
  });
});
