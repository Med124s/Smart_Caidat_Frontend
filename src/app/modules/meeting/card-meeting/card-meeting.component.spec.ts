import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMeetingComponent } from './card-meeting.component';

describe('CardMeetingComponent', () => {
  let component: CardMeetingComponent;
  let fixture: ComponentFixture<CardMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
