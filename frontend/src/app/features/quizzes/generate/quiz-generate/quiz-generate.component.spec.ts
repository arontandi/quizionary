import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizGenerateComponent } from './quiz-generate.component';

describe('QuizGenerateComponent', () => {
  let component: QuizGenerateComponent;
  let fixture: ComponentFixture<QuizGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
