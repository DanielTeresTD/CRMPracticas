import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailsDialog } from './client-form';

describe('ClientDetailsDialog', () => {
  let component: ClientDetailsDialog;
  let fixture: ComponentFixture<ClientDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailsDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
