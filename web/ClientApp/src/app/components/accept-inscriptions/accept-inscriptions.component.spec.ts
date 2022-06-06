import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptInscriptionsComponent } from './accept-inscriptions.component';

describe('AcceptInscriptionsComponent', () => {
  let component: AcceptInscriptionsComponent;
  let fixture: ComponentFixture<AcceptInscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptInscriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptInscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
