import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  // Usamos Angular Signals para tener un estado reactivo del usuario
  public currentUser = signal<User | null>(null);

  // Señal derivada para saber si el usuario es administrador
  public isAdmin = computed(() => this.currentUser()?.email === 'admin@admin.admin');

  constructor() {
    this.supabase = inject(SupabaseService).client;

    // Recuperar sesión inicial
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
    });

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  // Método de Registro
  async signUp(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
  }

  // Método de Inicio de Sesión
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  // Método de Cierre de Sesión
  async signOut() {
    return this.supabase.auth.signOut();
  }
}
