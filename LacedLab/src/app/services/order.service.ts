import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { Product } from './product.service';
import { SupabaseService } from './supabase.service';

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
    this.supabase = inject(SupabaseService).client;
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
    console.log('OrderService: Fetching all orders...');
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false });

    // Note: 'auth_users' might be a view or specific table depending on RLS/schema
    // If auth.users is not accessible directly, we might just use user_id or a profiles table

    if (error) {
      console.error('Error fetching all orders with profiles:', error.message);
      // Fallback if join fails (e.g. user_profiles view doesn't exist yet)
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
        
      console.log('OrderService: Fallback data count:', dataBasic?.length || 0);
      const mappedFallback = (dataBasic as any[] || []).map(order => ({
        ...order,
        items: order.order_items
      }));
      return mappedFallback as Order[];
    }

    console.log('OrderService: Orders fetched successfully, count:', data?.length || 0);
    const mappedData = (data as any[] || []).map(order => ({
      ...order,
      user_name: order.user?.full_name || 'Desconocido',
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
