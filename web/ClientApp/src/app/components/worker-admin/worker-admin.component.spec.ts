import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerAdminComponent } from './worker-admin.component';

describe('WorkerAdminComponent', () => {
  let component: WorkerAdminComponent;
  let fixture: ComponentFixture<WorkerAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
