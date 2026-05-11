import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Product } from './product.service';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  async getUserOrders(): Promise<Order[]> {
    const user = this.authService.currentUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error.message);
      return [];
    }

    const mappedData = (data as any[]).map(order => ({
      ...order,
      items: order.order_items
    }));

    return mappedData as Order[];
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        user:auth_users (email),
        order_items (
          *,
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false });

    // Note: 'auth_users' might be a view or specific table depending on RLS/schema
    // If auth.users is not accessible directly, we might just use user_id or a profiles table

    if (error) {
      console.error('Error fetching all orders:', error.message);
      // Fallback if auth_users join fails
      const { data: dataBasic, error: errorBasic } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false });
      const mappedFallback = (dataBasic as any[] || []).map(order => ({
        ...order,
        items: order.order_items
      }));
      return mappedFallback as Order[];
    }

    const mappedData = (data as any[]).map(order => ({
      ...order,
      items: order.order_items
    }));

    return mappedData as Order[];
  }
  async createOrder(items: any[], totalAmount: number, shippingAddress: string = 'Dirección de prueba'): Promise<Order | null> {
    const user = this.authService.currentUser();
    if (!user || items.length === 0) return null;

    // 1. Crear el pedido
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        notes: 'Pedido realizado desde la web'
      }])
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError?.message);
      return null;
    }

    // 2. Crear los items del pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      size: item.selectedSize
    }));

    const { error: itemsError } = await this.supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError.message);
      // Podríamos borrar el pedido si falla esto, pero por simplicidad lo dejamos así
      return null;
    }

    return order as Order;
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    const { error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error.message);
      return false;
    }
    return true;
  }
}
