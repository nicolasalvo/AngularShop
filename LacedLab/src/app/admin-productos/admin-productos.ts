import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../services/product.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
})
export class AdminProductos implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  showModal = false;
  saving = false;

  newProduct: Omit<Product, 'id' | 'category'> = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    brand: '',
    sizes: [],
    image_url: '',
    is_active: true,
    category_id: ''
  };

  sizeInput = '';
  imageFile: File | null = null;
  imagePreview: string | null = null;

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [products, categories] = await Promise.all([
        this.productService.getProducts(),
        this.productService.getCategories()
      ]);
      this.products = products;
      this.categories = categories;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
  }

  resetForm() {
    this.newProduct = {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      brand: '',
      sizes: [],
      image_url: '',
      is_active: true,
      category_id: ''
    };
    this.sizeInput = '';
    this.imageFile = null;
    this.imagePreview = null;
  }

  addSize() {
    if (this.sizeInput.trim() && !this.newProduct.sizes.includes(this.sizeInput.trim())) {
      this.newProduct.sizes.push(this.sizeInput.trim());
      this.sizeInput = '';
    }
  }

  removeSize(size: string) {
    this.newProduct.sizes = this.newProduct.sizes.filter(s => s !== size);
  }

  generateSlug() {
    this.newProduct.slug = this.newProduct.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async saveProduct() {
    if (!this.isFormValid()) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    this.saving = true;
    try {
      // 1. Subir imagen si hay un archivo seleccionado
      if (this.imageFile) {
        const publicUrl = await this.productService.uploadImage(this.imageFile);
        if (publicUrl) {
          this.newProduct.image_url = publicUrl;
        } else {
          alert('Error al subir la imagen. Inténtalo de nuevo.');
          this.saving = false;
          return;
        }
      }

      // 2. Guardar producto
      const result = await this.productService.addProduct(this.newProduct);
      if (result) {
        this.closeModal();
        await this.loadData();
      } else {
        alert('Error al guardar el producto.');
      }
    } catch (error) {
      console.error('Error in saveProduct:', error);
      alert('Ocurrió un error inesperado.');
    } finally {
      this.saving = false;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.newProduct.name &&
      this.newProduct.slug &&
      this.newProduct.description &&
      this.newProduct.price > 0 &&
      this.newProduct.stock >= 0 &&
      this.newProduct.brand &&
      this.newProduct.category_id &&
      this.newProduct.sizes.length > 0 &&
      (this.newProduct.image_url || this.imageFile)
    );
  }
}
