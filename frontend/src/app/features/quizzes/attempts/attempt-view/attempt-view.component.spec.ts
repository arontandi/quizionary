import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptViewComponent } from './attempt-view.component';

describe('AttemptViewComponent', () => {
  let component: AttemptViewComponent;
  let fixture: ComponentFixture<AttemptViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
