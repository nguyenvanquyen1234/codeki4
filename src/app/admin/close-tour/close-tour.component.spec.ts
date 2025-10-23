import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseTourComponent } from './close-tour.component';

describe('CloseTourComponent', () => {
  let component: CloseTourComponent;
  let fixture: ComponentFixture<CloseTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseTourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
