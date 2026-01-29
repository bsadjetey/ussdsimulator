import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVersionCheckerComponent } from './new-version-checker.component';

describe('NewVersionCheckerComponent', () => {
  let component: NewVersionCheckerComponent;
  let fixture: ComponentFixture<NewVersionCheckerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewVersionCheckerComponent]
    });
    fixture = TestBed.createComponent(NewVersionCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
