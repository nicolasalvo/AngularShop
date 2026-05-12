import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header-component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  
  showCart = signal(false);
  isCheckoutLoading = signal(false);

  isLoggedIn = computed(() => this.authService.currentUser() !== null);
  isAdmin = this.authService.isAdmin;
  user = this.authService.currentUser;

  cartCount = toSignal(this.cartService.totalItems$, { initialValue: 0 });
  cartItems = toSignal(this.cartService.cartItems$, { initialValue: [] });

  cartTotal = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  toggleCart() {
    console.log('toggleCart clicked. Current state:', this.showCart());
    this.showCart.update(v => !v);
  }

  async checkout() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.showCart.set(false);
      return;
    }

    if (this.cartItems().length === 0) return;

    this.showCart.set(false);
    this.router.navigate(['/checkout']);
  }

  async onSignOut() {
    await this.authService.signOut();
    this.router.navigate(['/inicio']);
  }
}
