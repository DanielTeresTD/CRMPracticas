import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusesMap } from './buses-map';

describe('BusesMap', () => {
  let component: BusesMap;
  let fixture: ComponentFixture<BusesMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusesMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusesMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
