import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  product: Product | null = null;
  selectedSize: string | null = null;
  loading = true;

  async ngOnInit() {
    try {
      const slug = this.route.snapshot.paramMap.get('slug');
      console.log('ProductoDetalle: Buscando slug:', slug);
      if (slug) {
        this.product = await this.productService.getProductBySlug(slug);
        console.log('ProductoDetalle: Producto encontrado:', this.product);
      }
    } catch (error) {
      console.error('ProductoDetalle: Error en ngOnInit:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  addToCart() {
    if (this.product && this.selectedSize) {
      this.cartService.addToCart(this.product, this.selectedSize);
    }
  }

  removeFromCart() {
    if (this.product && this.selectedSize) {
      this.cartService.decrementQuantity(this.product, this.selectedSize);
    }
  }

  getProductQuantity(productId: string, size?: string): number {
    return this.cartService.getQuantity(productId, size);
  }
}
