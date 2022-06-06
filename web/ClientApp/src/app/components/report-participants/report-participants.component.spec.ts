import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportParticipantsComponent } from './report-participants.component';

describe('ReportParticipantsComponent', () => {
  let component: ReportParticipantsComponent;
  let fixture: ComponentFixture<ReportParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportParticipantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
