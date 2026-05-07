import { Component, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Usamos computed para crear una señal derivada que nos dice si el usuario está logueado
  isLoggedIn = computed(() => this.authService.currentUser() !== null);
  user = this.authService.currentUser;

  async onSignOut() {
    await this.authService.signOut();
    this.router.navigate(['/inicio']);
  }
}
