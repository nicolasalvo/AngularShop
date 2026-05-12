import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.html',
})
export class AdminPedidos implements OnInit {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  orders: Order[] = [];
  loading = true;

  showModal = false;
  selectedOrder: Order | null = null;
  isSaving = false;

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.loading = true;
    try {
      this.orders = await this.orderService.getAllOrders();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openEditModal(order: Order) {
    this.selectedOrder = JSON.parse(JSON.stringify(order));
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }

  async saveChanges() {
    if (!this.selectedOrder) return;
    
    this.isSaving = true;
    try {
      const success = await this.orderService.updateOrder(this.selectedOrder.id, {
        status: this.selectedOrder.status,
        shipping_address: this.selectedOrder.shipping_address,
        notes: this.selectedOrder.notes
      });
      
      if (success) {
        console.log('Pedido actualizado con éxito');
        this.closeModal();
        await this.loadOrders();
      } else {
        console.log('Error al actualizar el pedido');
      }
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }
}
