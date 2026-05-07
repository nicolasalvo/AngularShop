import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
      return;
    }

    this.isLoading = true;

    try {
      const { data, error } = await this.authService.signIn(this.email, this.password);
      
      if (error) {
        this.errorMessage = error.message;
        // Traducir error común
        if (error.message.includes('Invalid login credentials')) {
          this.errorMessage = 'Credenciales inválidas. Comprueba tu correo o contraseña.';
        }
        return;
      }

      // Si todo va bien, redirigimos al inicio
      this.router.navigate(['/inicio']);
      
    } catch (err: any) {
      this.errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }
}
