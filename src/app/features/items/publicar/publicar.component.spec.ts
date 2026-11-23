import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { environment } from '../../../../environments/environment';
import { PublicarComponent } from './publicar.component';

const publishI18n = {
  step1_title: '¿Qué regalas?',
  step2_title: 'Añade fotos',
  step3_title: 'Revisa y publica',
  step_indicator: 'Paso {{current}} de {{total}}',
  field_title: 'Título',
  field_description: 'Descripción',
  field_postal_code: 'Código postal del objeto',
  field_condition: 'Condición',
  field_category: 'Categoría',
  field_weight_range: 'Peso aproximado',
  placeholder_title: 'Ej: Bicicleta',
  placeholder_description: 'Describe…',
  placeholder_postal: '28001',
  condition_new: 'A estrenar',
  condition_like_new: 'Como nuevo',
  condition_good: 'Buen estado',
  condition_fair: 'Aceptable',
  photos_intro: 'Añade hasta 5 fotos.',
  review_notice: 'Revisa los datos',
  review_photos_label: 'Fotos',
  photo_one: 'foto',
  photo_many: 'fotos',
  success_hint: 'Después de publicar…',
  btn_continue: 'Continuar',
  btn_back: 'Atrás',
  btn_publish: 'Publicar objeto',
  btn_publishing: 'Publicando…',
  validation: {
    title_required: 'El título es obligatorio',
    title_max: 'Máx 100',
    description_required: 'La descripción es obligatoria',
    description_max: 'Máx 1000',
    postal_required: 'CP obligatorio',
    postal_format: '5 dígitos',
    category_required: 'Elige una categoría',
    weight_range_required: 'Elige un rango de peso',
  },
  errors: {
    photos_required: 'Añade al menos una foto.',
    generic: 'No se pudo publicar.',
    connection: 'Error de conexión.',
    field_invalid: 'Inválido',
    field_title: 'Revisa título',
    field_description: 'Revisa descripción',
    field_condition: 'Revisa condición',
    field_postal_code: 'CP inválido',
    field_category: 'Revisa categoría',
    field_weight_range: 'Revisa rango de peso',
    field_images: 'Revisa imágenes',
  },
  success: { title: 'Objeto publicado' },
};

const categoryI18n = {
  furniture: 'Muebles',
  electronics: 'Electrónica',
  clothing: 'Ropa',
  books: 'Libros',
  toys: 'Juguetes',
  kitchen: 'Cocina',
  sports: 'Deporte',
  tools: 'Herramientas',
  other: 'Otro',
};

const weightRangeI18n = {
  lt1: 'Menos de 1 kg',
  '1to5': '1-5 kg',
  '5to20': '5-20 kg',
  gt20: 'Más de 20 kg',
};

const esJson = {
  items: {
    publish: publishI18n,
    category: categoryI18n,
    weight_range: weightRangeI18n,
    image_picker: {
      add: 'Añadir',
      main: 'Principal',
      photo_n: 'Foto {{n}}',
      remove: 'Eliminar foto',
      processing: 'Procesando…',
      format_invalid: 'Formato no compatible.',
      too_large: 'Demasiado grande.',
      max_reached: 'Máximo 5 fotos.',
      hint: 'Hint',
    },
  },
};

describe('PublicarComponent', () => {
  let itemsPost: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(async () => {
    itemsPost = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        PublicarComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'mis-objetos/publicar', component: PublicarComponent },
          { path: 'mis-objetos', component: class {} },
        ]),
        { provide: ItemsService, useValue: { itemsPost } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    await router.navigate(['/mis-objetos/publicar']);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(PublicarComponent);
    fixture.detectChanges();
    return fixture;
  }

  function fillStep1(fixture: ReturnType<typeof createFixture>) {
    const comp = fixture.componentInstance;
    comp.form.patchValue({
      title: 'Bicicleta',
      description: 'En buen estado',
      postalCode: '28001',
      condition: 'good',
      category: 'furniture',
      weightRange: '1to5',
    });
    comp.form.markAllAsTouched();
    fixture.detectChanges();
  }

  it('blocks continue on step 1 when title is only whitespace (AC 3)', async () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    comp.form.patchValue({ title: '   ', description: 'ok', postalCode: '28001' });
    comp.form.markAllAsTouched();
    await comp.continue();
    expect(comp.step()).toBe(1);
    expect(comp.fieldError('title')).toBeTruthy();
  });

  it('blocks continue on step 1 when title is empty (AC 3)', async () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    await comp.continue();
    expect(comp.step()).toBe(1);
    expect(comp.fieldError('title')).toBeTruthy();
  });

  it('blocks continue on step 1 when category or weightRange is missing (AC 1)', async () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    comp.form.patchValue({
      title: 'Bicicleta',
      description: 'En buen estado',
      postalCode: '28001',
      condition: 'good',
      category: '',
      weightRange: '',
    });
    comp.form.markAllAsTouched();
    await comp.continue();
    expect(comp.step()).toBe(1);
    expect(comp.fieldError('category')).toBeTruthy();
    expect(comp.fieldError('weightRange')).toBeTruthy();
  });

  it('requires at least one image before reaching step 3 (AC 3)', async () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    expect(comp.step()).toBe(2);
    await comp.continue();
    expect(comp.step()).toBe(2);
    expect(comp.photosError()).toContain('foto');
  });

  it('calls itemsPost with correct body on publish (AC 1)', async () => {
    itemsPost.mockResolvedValue({
      id: 'item-1',
      title: 'Bicicleta',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    });

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    expect(comp.step()).toBe(3);

    await comp.publish();
    await vi.waitFor(() => expect(itemsPost).toHaveBeenCalled());

    expect(itemsPost).toHaveBeenCalledWith({
      body: {
        category: 'furniture',
        weightRange: '1to5',
        title: 'Bicicleta',
        description: 'En buen estado',
        condition: 'good',
        postalCode: '28001',
        images: expect.any(Array),
      },
    });
  });

  it('maps 400 category error to inline field on step 1 (AC 4)', async () => {
    itemsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { category: ['Invalid category'] } },
      }),
    );

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    await comp.publish();

    expect(comp.serverFieldErrorKeys()['category']).toBe(
      'items.publish.errors.field_category',
    );
    expect(comp.step()).toBe(1);
  });

  it('shows errors on 400 without clearing form (AC 2)', async () => {
    itemsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { title: ['Too short'] } },
      }),
    );

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    await comp.publish();

    expect(comp.form.controls.title.value).toBe('Bicicleta');
    expect(comp.imageBlobs().length).toBe(1);
    expect(comp.serverFieldErrorKeys()['title']).toBe(
      'items.publish.errors.field_title',
    );
    expect(comp.step()).toBe(1);
  });

  it('shows server images error on step 2 (AC 2)', async () => {
    itemsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { images: ['Too large'] } },
      }),
    );

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    await comp.publish();

    expect(comp.step()).toBe(2);
    expect(comp.photosErrorMessage()).toContain('imágenes');
  });

  it('clears server field errors on goBack (AC 2)', async () => {
    itemsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { title: ['Too short'] } },
      }),
    );

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    await comp.publish();
    expect(comp.serverFieldErrorKeys()['title']).toBeTruthy();

    comp.goBack();
    expect(comp.serverFieldErrorKeys()).toEqual({});
  });

  it('navigates to /mis-objetos on 201 (AC 1)', async () => {
    itemsPost.mockResolvedValue({
      id: 'item-99',
      slug: 'bicicleta',
      title: 'Bicicleta',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    const comp = fixture.componentInstance;
    fillStep1(fixture);
    await comp.continue();
    comp.onImages([new Blob(['a'], { type: 'image/webp' })]);
    await comp.continue();
    await comp.publish();

    expect(comp.publishedItemId()).toBe('item-99');
    expect(comp.publishShareUrl()).toBe(`${environment.siteUrl}/items/bicicleta`);
    await comp.goToMyItemsFromShareModal();
    expect(comp.publishShareUrl()).toBe('');

    expect(navigateSpy).toHaveBeenCalledWith(['/mis-objetos'], {
      queryParams: { published: 'item-99' },
    });
  });
});
