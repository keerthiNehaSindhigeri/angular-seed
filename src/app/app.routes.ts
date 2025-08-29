import { Routes } from '@angular/router';
import { DASHBOARD_ROUTES } from './modules/dashboard/dashboard.routes';
import {INVOICE_DETAILS_ROUTES} from "./modules/dashboard/invoice_details/invoice-details.routes";
export const routes: Routes = [

  {
    path: '',
    children: [
      ...DASHBOARD_ROUTES,
      ...INVOICE_DETAILS_ROUTES
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }


];
