import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  sizes: string[];
  image_url: string;
  is_active: boolean;
  category?: Category;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = inject(SupabaseService).client;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(4);

    if (error) {
      console.error('Error fetching products:', error.message);
      return [];
    }

    return data as Product[];
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all products:', error.message);
      return [];
    }

    return data as Product[];
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching product by slug:', error.message);
      return null;
    }

    return data as Product;
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error.message);
      return [];
    }

    return data as Category[];
  }

  async addProduct(product: Omit<Product, 'id' | 'category'>): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error.message);
      return null;
    }

    return data as Product;
  }

  async uploadImage(file: File): Promise<string | null> {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await this.supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      return null;
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}
