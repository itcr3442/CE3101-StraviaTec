import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubscribedComponent } from './user-subscribed.component';

describe('UserSubscribedComponent', () => {
  let component: UserSubscribedComponent;
  let fixture: ComponentFixture<UserSubscribedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSubscribedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubscribedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
