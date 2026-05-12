import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  public currentUser = signal<User | null>(null);

  public isAdmin = computed(() => this.currentUser()?.email === 'admin@admin.admin');

  constructor() {
    this.supabase = inject(SupabaseService).client;

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

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

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }
}
