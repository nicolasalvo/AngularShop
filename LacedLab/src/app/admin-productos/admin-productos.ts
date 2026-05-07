import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-productos.html',
})
export class AdminProductos {
  products: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    this.products = await this.productService.getProducts();
    this.loading = false;
  }
}
