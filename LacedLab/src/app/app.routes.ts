import { Routes } from '@angular/router';
import { RegisterComponent } from './register-component/register-component';
import { InicioComponent } from './inicio-component/inicio-component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'inicio', component: InicioComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];
