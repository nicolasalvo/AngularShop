import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-pedidos-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pedidos-component.html',
})
export class PedidosComponent implements OnInit {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  myOrders: Order[] = [];
  loading = true;

  expandedOrderId: string | null = null;

  async ngOnInit() {
    try {
      this.myOrders = await this.orderService.getUserOrders();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  toggleOrder(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    this.cdr.detectChanges();
  }
}
