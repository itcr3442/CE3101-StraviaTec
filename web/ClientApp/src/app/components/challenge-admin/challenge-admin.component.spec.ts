import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeAdminComponent } from './challenge-admin.component';

describe('ChallengeAdminComponent', () => {
  let component: ChallengeAdminComponent;
  let fixture: ComponentFixture<ChallengeAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
