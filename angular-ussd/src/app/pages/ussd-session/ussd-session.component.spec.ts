import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdSessionComponent } from './ussd-session.component';

describe('UssdSessionComponent', () => {
  let component: UssdSessionComponent;
  let fixture: ComponentFixture<UssdSessionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UssdSessionComponent]
    });
    fixture = TestBed.createComponent(UssdSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
