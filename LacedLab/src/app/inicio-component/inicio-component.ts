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
      const data = await this.productService.getFeaturedProducts();
      this.products = data;
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
