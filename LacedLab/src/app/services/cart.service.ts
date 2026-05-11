import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private supabase: SupabaseClient;
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  // Observable para el total de items en la cesta
  totalItems$ = new BehaviorSubject<number>(0);

  constructor(private authService: AuthService) {
    this.supabase = inject(SupabaseService).client;

    // Escuchar cambios de autenticación para cargar/limpiar la cesta
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('CartService: Auth event:', event);
      if (session?.user) {
        this.loadCartFromSupabase(session.user.id);
      } else {
        this.cartItems.next([]);
        this.loadFromLocal();
      }
    });

    this.initCart();
  }

  private async initCart() {
    const user = this.authService.currentUser();
    if (user) {
      await this.loadCartFromSupabase(user.id);
    } else {
      this.loadFromLocal();
    }
  }

  private loadFromLocal() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart_guest');
      if (saved) {
        const items = JSON.parse(saved);
        this.cartItems.next(items);
        this.updateTotalCount(items);
      }
    }
  }

  private saveToLocal(items: CartItem[]) {
    if (typeof window !== 'undefined' && !this.authService.currentUser()) {
      localStorage.setItem('cart_guest', JSON.stringify(items));
    }
  }

  async loadCartFromSupabase(userId: string) {
    console.log('CartService: Cargando cesta desde Supabase para:', userId);
    const { data, error } = await this.supabase
      .from('cart_items')
      .select(`
        quantity,
        size,
        products (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error cargando cesta Supabase:', error.message);
      return;
    }

    if (data) {
      const items: CartItem[] = data.map((item: any) => ({
        ...item.products,
        quantity: item.quantity,
        selectedSize: item.size
      }));
      this.cartItems.next(items);
      this.updateTotalCount(items);
    }
  }

  async addToCart(product: Product, size?: string) {
    console.log('CartService: Añadiendo producto:', product.name, 'Talla:', size);
    const user = this.authService.currentUser();
    const currentQuantity = this.getQuantity(product.id, size);
    const newQuantity = currentQuantity + 1;

    await this.updateQuantity(product, newQuantity, size);
  }

  async decrementQuantity(product: Product, size?: string) {
    const currentQuantity = this.getQuantity(product.id, size);
    if (currentQuantity <= 1) {
      await this.removeFromCart(product.id, size);
    } else {
      await this.updateQuantity(product, currentQuantity - 1, size);
    }
  }

  async removeFromCart(productId: string, size?: string) {
    const user = this.authService.currentUser();
    
    // Actualizar localmente
    const newItems = this.cartItems.value.filter(item => 
      !(item.id === productId && item.selectedSize === size)
    );
    this.cartItems.next(newItems);
    this.updateTotalCount(newItems);

    if (user) {
      const query = this.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (size) {
        query.eq('size', size);
      } else {
        query.is('size', null);
      }

      await query;
    } else {
      this.saveToLocal(newItems);
    }
  }

  private async updateQuantity(product: Product, quantity: number, size?: string) {
    const user = this.authService.currentUser();
    
    this.updateLocalState(product, quantity, size);

    if (user) {
      const upsertData: any = { 
        user_id: user.id, 
        product_id: product.id, 
        quantity: quantity,
        size: size || null
      };

      const { error } = await this.supabase
        .from('cart_items')
        .upsert(upsertData, { onConflict: 'user_id, product_id, size' });

      if (error) console.error('Error Supabase upsert:', error.message);
    } else {
      this.saveToLocal(this.cartItems.value);
    }
  }

  private updateLocalState(product: Product, quantity: number, size?: string) {
    const currentItems = this.cartItems.value;
    const existingIndex = currentItems.findIndex(item => 
      item.id === product.id && item.selectedSize === size
    );
    
    let newItems;
    if (existingIndex >= 0) {
      newItems = [...currentItems];
      newItems[existingIndex] = { ...newItems[existingIndex], quantity };
    } else {
      newItems = [...currentItems, { ...product, quantity, selectedSize: size }];
    }
    
    this.cartItems.next(newItems);
    this.updateTotalCount(newItems);
  }

  private updateTotalCount(items: CartItem[]) {
    const total = items.reduce((acc, item) => acc + item.quantity, 0);
    this.totalItems$.next(total);
  }

  getQuantity(productId: string, size?: string): number {
    const item = this.cartItems.value.find(item => 
      item.id === productId && item.selectedSize === size
    );
    return item ? item.quantity : 0;
  }

  async clearCart() {
    const user = this.authService.currentUser();
    this.cartItems.next([]);
    this.updateTotalCount([]);

    if (user) {
      await this.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_guest');
      }
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }
}
