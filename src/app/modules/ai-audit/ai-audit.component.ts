import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-ai-audit',
  standalone: true,
  imports: [AlertDialogComponent],
  templateUrl: './ai-audit.component.html',
  styleUrl: './ai-audit.component.scss'
})
export class AiAuditComponent implements OnInit {
  isLoading = false;
  private dialogRef = inject(MatDialogRef<AiAuditComponent>);

  ngOnInit(): void {
    this.startAudit();
  }

  startAudit(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close();
    }, 2000);
  }
}
