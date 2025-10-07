import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportToPdf } from './export-to-pdf';

describe('ExportToPdf', () => {
  let component: ExportToPdf;
  let fixture: ComponentFixture<ExportToPdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportToPdf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportToPdf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
