import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPedidos } from './admin-pedidos';

describe('AdminPedidos', () => {
  let component: AdminPedidos;
  let fixture: ComponentFixture<AdminPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
