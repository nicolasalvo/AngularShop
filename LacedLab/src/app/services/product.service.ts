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
      .rpc('insert_product', {
        p_name: product.name,
        p_price: product.price,
        p_category_id: product.category_id,
        p_description: product.description,
        p_stock: product.stock,
        p_brand: product.brand,
        p_sizes: product.sizes,
        p_image_url: product.image_url
      });

    if (error) {
      console.error('Error adding product via RPC:', error.message);
      const { data: directData, error: directError } = await this.supabase
        .from('products')
        .insert([product])
        .select()
        .single();
        
      if (directError) {
        console.error('Error adding product directly:', directError.message);
        return null;
      }
      return directData as Product;
    }

    return data as Product;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
    const { error } = await this.supabase
      .rpc('update_product', {
        p_id: id,
        p_name: product.name,
        p_description: product.description,
        p_price: product.price,
        p_stock: product.stock,
        p_brand: product.brand,
        p_category_id: product.category_id,
        p_sizes: product.sizes,
        p_image_url: product.image_url,
        p_is_active: product.is_active
      });

    if (error) {
      console.error('Error updating product via RPC:', error.message);
      const { error: directError } = await this.supabase
        .from('products')
        .update(product)
        .eq('id', id);

      if (directError) {
        console.error('Error updating product directly:', directError.message);
        return false;
      }
    }
    return true;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('soft_delete_product', { product_id: id });

    if (error) {
      console.error('Error deleting product via RPC:', error.message);
      const { error: directError } = await this.supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (directError) {
        console.error('Error deleting product directly:', directError.message);
        return false;
      }
    }
    return true;
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
