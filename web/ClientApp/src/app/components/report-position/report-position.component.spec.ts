import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPositionComponent } from './report-position.component';

describe('ReportPositionComponent', () => {
  let component: ReportPositionComponent;
  let fixture: ComponentFixture<ReportPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportPositionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
