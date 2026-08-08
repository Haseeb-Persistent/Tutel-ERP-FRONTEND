/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ErpListComponent } from './Erp-list.component';

describe('ErpListComponent', () => {
  let component: ErpListComponent;
  let fixture: ComponentFixture<ErpListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErpListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
