import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth/signup',
    pathMatch: 'full'
  },

  // 🔐 AUTH ROUTES (LAZY LOADED)
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'auth/signup',
    loadComponent: () => import('./auth/signup/signup').then(m => m.Signup)
  },

  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },

  // 👤 USER PORTAL ROUTES (LAZY LOADED)
  {
    path: 'user/dashboard',
    loadComponent: () => import('./user/dashboard/dashboard').then(m => m.Dashboard)
  },

  {
    path: 'user/my-tasks',
    loadComponent: () => import('./user/my-tasks/my-tasks').then(m => m.MyTasksComponent)
  },

  {
    path: 'user/create-task',
    loadComponent: () => import('./user/create-task/create-task').then(m => m.CreateTaskComponent)
  },

  {
    path: 'user/edit-task/:id',
    loadComponent: () => import('./user/edit-task/edit-task').then(m => m.EditTaskComponent)
  },

  {
    path: 'user/profile',
    loadComponent: () => import('./user/profile/profile').then(m => m.ProfileComponent)
  },

  {
    path: 'user/change-password',
    loadComponent: () => import('./user/change-password/change-password').then(m => m.ChangePasswordComponent)
  },

  // ⚙️ ADMIN PORTAL ROUTES (LAZY LOADED WITH GUARD)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },

  {
    path: 'admin/users',
    loadComponent: () => import('./admin/users/users').then(m => m.UsersComponent),
    canActivate: [adminGuard]
  },

  {
    path: 'admin/all-tasks',
    loadComponent: () => import('./admin/all-tasks/all-tasks').then(m => m.AllTasksComponent),
    canActivate: [adminGuard]
  },

  // 🛠️ SHARED COMPONENTS (LAZY LOADED)
  {
    path: 'shared/sidebar',
    loadComponent: () => import('./shared/components/sidebar/sidebar').then(m => m.SidebarComponent)
  },
  
  {
    path: 'shared/header',
    loadComponent: () => import('./shared/components/header/header').then(m => m.HeaderComponent)
  }

];