import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUsageCharts } from './data-usage-charts';

describe('DataUsageCharts', () => {
  let component: DataUsageCharts;
  let fixture: ComponentFixture<DataUsageCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataUsageCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataUsageCharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
