import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedidos-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pedidos-component.html',
})
export class PedidosComponent {
  myOrders = [
    { id: 'ORD-7721', date: '2026-05-07', total: 450, status: 'Completado', items: 2 },
  ];
}
