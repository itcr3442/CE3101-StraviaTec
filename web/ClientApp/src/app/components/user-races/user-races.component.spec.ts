import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRacesComponent } from './user-races.component';

describe('UserRacesComponent', () => {
  let component: UserRacesComponent;
  let fixture: ComponentFixture<UserRacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRacesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
