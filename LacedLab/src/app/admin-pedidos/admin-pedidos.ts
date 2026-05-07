import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-pedidos.html',
})
export class AdminPedidos {
  orders = [
    { id: 'ORD-7721', date: '2026-05-07', customer: 'Nico', total: 450, status: 'Completado' },
    { id: 'ORD-7722', date: '2026-05-07', customer: 'Admin User', total: 1200, status: 'Pendiente' },
    { id: 'ORD-7723', date: '2026-05-06', customer: 'Usuario Test', total: 220, status: 'Enviado' },
  ];
}
