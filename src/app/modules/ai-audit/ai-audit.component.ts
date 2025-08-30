import { Component, OnInit, inject,Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ai-audit',
  standalone: true,
  imports: [],
  templateUrl: './ai-audit.component.html',
  styleUrl: './ai-audit.component.scss'
})
export class AiAuditComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { day: number }) { }

  private dialogRef = inject(MatDialogRef<AiAuditComponent>);

  ngOnInit(): void {
    this.startAudit();
  }

  startAudit(): void {
    // Simulate AI audit process
  }
  onCancel(): void {
    this.dialogRef.close({ cancelled: true });
  }
}
