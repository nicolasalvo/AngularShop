import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-catalogo-component',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './catalogo-component.html',
  styleUrl: './catalogo-component.css',
})
export class CatalogoComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;

  searchTerm: string = '';
  selectedBrand: string = 'Todas';
  sortBy: string = 'newest';

  brands: string[] = ['Todas'];
  selectedProductId: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  addToCart(product: Product, size?: string) {
    if (!size && product.sizes && product.sizes.length > 0) {
      this.selectedProductId = (this.selectedProductId === product.id) ? null : product.id;
      return;
    }
    this.cartService.addToCart(product, size);
    this.selectedProductId = null;
  }

  decrementQuantity(product: Product, size?: string) {
    this.cartService.decrementQuantity(product, size);
  }

  decrementProduct(product: Product) {
    const itemsInCart = this.getSizesInCart(product.id);
    if (itemsInCart.length === 1) {
      this.decrementQuantity(product, itemsInCart[0]);
    } else {
      // Si hay varias tallas, abrimos el selector para que elija cuál quitar
      this.selectedProductId = product.id;
    }
  }

  getSizesInCart(productId: string): string[] {
    const items = this.cartService.getCartItems();
    return items
      .filter(item => item.id === productId && item.selectedSize)
      .map(item => item.selectedSize as string);
  }

  getProductQuantity(productId: string, size?: string): number {
    return this.cartService.getQuantity(productId, size);
  }

  getTotalProductQuantity(productId: string): number {
    const items = this.cartService.getCartItems();
    return items
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  }

  async ngOnInit() {
    try {
      console.log('CatalogoComponent: Fetching all products...');
      const data = await this.productService.getProducts();
      this.allProducts = data;
      this.filteredProducts = [...data];
      
      // Extraer marcas únicas
      const uniqueBrands = [...new Set(data.map(p => p.brand))];
      this.brands = ['Todas', ...uniqueBrands];

      this.loading = false;
      this.applyFilters();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('CatalogoComponent: Error in ngOnInit:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilters() {
    let results = this.allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           product.brand.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBrand = this.selectedBrand === 'Todas' || product.brand === this.selectedBrand;
      
      return matchesSearch && matchesBrand;
    });

    // Ordenación
    if (this.sortBy === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      // 'newest' ya viene por defecto del servicio si no cambiamos el orden original
    }

    this.filteredProducts = results;
    this.cdr.detectChanges();
  }
}
