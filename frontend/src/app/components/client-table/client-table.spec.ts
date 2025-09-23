import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTable } from './client-table';

describe('ClientTable', () => {
  let component: ClientTable;
  let fixture: ComponentFixture<ClientTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
