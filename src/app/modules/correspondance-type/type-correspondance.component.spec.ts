import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCorrespondanceComponent } from './type-correspondance.component';

describe('TypeCorrespondanceComponent', () => {
  let component: TypeCorrespondanceComponent;
  let fixture: ComponentFixture<TypeCorrespondanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeCorrespondanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeCorrespondanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
