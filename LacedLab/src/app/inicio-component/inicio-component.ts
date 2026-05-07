import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-inicio-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css',
})
export class InicioComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      console.log('InicioComponent: Fetching products...');
      const data = await this.productService.getFeaturedProducts();
      console.log('InicioComponent: Data received:', data);
      this.products = data;
      this.loading = false;
      this.cdr.detectChanges(); // Forzamos la detección de cambios
      console.log('InicioComponent: Loading set to false and detectChanges called');
    } catch (err) {
      console.error('InicioComponent: Error in ngOnInit:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
