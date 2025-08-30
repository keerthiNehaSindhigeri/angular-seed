import { Component, inject } from '@angular/core';
import { InvoiceDetailsComponent } from "./invoice_details/invoice-details.component";
import { ExceptionsComponent } from '../exceptions/exceptions.component';
import { MatDialog } from '@angular/material/dialog';
import { AiAuditComponent } from '../ai-audit/ai-audit.component';

@Component({
  selector: 'app-dashboard',
  imports: [InvoiceDetailsComponent, ExceptionsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {
  private readonly dialog = inject(MatDialog);

  onButtonClick(): void {
    this.dialog.open(AiAuditComponent);
  }
}
