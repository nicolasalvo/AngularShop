import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  cartItems = toSignal(this.cartService.cartItems$, { initialValue: [] });
  cartTotal = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  shippingInfo = {
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  };

  isProcessing = signal(false);

  async placeOrder() {
    if (this.cartItems().length === 0) return;
    
    if (!this.isFormValid()) {
      alert('Por favor, completa todos los campos de envío.');
      return;
    }

    this.isProcessing.set(true);
    try {
      const fullAddress = `${this.shippingInfo.address}, ${this.shippingInfo.city}, ${this.shippingInfo.postalCode}`;
      const order = await this.orderService.createOrder(this.cartItems(), this.cartTotal(), fullAddress);
      
      if (order) {
        await this.cartService.clearCart();
        this.router.navigate(['/pedidos']);
        alert('¡Pedido realizado con éxito! Gracias por confiar en LacedLab.');
      } else {
        alert('Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ocurrió un error inesperado.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.shippingInfo.fullName &&
      this.shippingInfo.address &&
      this.shippingInfo.city &&
      this.shippingInfo.postalCode &&
      this.shippingInfo.phone
    );
  }
}
