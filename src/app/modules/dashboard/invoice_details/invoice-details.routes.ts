import { Routes } from "@angular/router";

export const INVOICE_DETAILS_ROUTES: Routes = [
  {
    path: 'invoiceDetails',
    title: 'invoice-details',
    loadComponent: () => import('./invoice-details.component').then(m => m.InvoiceDetailsComponent),
  },
];
