import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsAdminComponent } from './groups-admin.component';

describe('GroupsAdminComponent', () => {
  let component: GroupsAdminComponent;
  let fixture: ComponentFixture<GroupsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupsAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
