import { Routes } from '@angular/router';
import { RegisterComponent } from './register-component/register-component';
import { LoginComponent } from './login-component/login-component';
import { InicioComponent } from './inicio-component/inicio-component';
import { CatalogoComponent } from './catalogo-component/catalogo-component';
import { PedidosComponent } from './pedidos-component/pedidos-component';

import { AdminProductos } from './admin-productos/admin-productos';
import { AdminPedidos } from './admin-pedidos/admin-pedidos';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'admin-productos', component: AdminProductos },
  { path: 'admin-pedidos', component: AdminPedidos },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];
