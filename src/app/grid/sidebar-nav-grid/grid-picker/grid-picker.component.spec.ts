import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridPickerComponent } from './grid-picker.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QueryGridService } from './../../query-grid.service';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpClientModule, HttpHandler } from '@angular/common/http';

describe('GridPickerComponent', () => {
  let component: GridPickerComponent;
  let fixture: ComponentFixture<GridPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridPickerComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        QueryGridService, 
        HttpClientTestingModule, 
        HttpTestingController, 
        HttpClient, 
        HttpClientModule, 
        HttpHandler, ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
