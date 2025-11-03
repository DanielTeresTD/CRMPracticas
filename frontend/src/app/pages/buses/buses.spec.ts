import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buses } from './buses';

describe('Buses', () => {
  let component: Buses;
  let fixture: ComponentFixture<Buses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
