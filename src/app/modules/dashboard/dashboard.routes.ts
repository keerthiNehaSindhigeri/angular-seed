import { Routes } from "@angular/router";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
  },
];
