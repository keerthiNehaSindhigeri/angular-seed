import { Component, OnInit, inject } from '@angular/core';
import { ExceptionModel, ExceptionRow } from './exceptions.interface';

import { MatDialog } from '@angular/material/dialog';
import { AiAuditComponent } from '../ai-audit/ai-audit.component';

@Component({
  selector: 'app-exceptions',
  templateUrl: './exceptions.component.html',
  styleUrls: ['./exceptions.component.scss']
})
export class ExceptionsComponent implements OnInit {

  exceptionTitles = [
    "Hotel Occ. (95% Required)",
    "Billable No-Shows",
    "Crew ID Issues",
    "Non-contract Rate",
    "Walk-Ins",
    "Modified Reservations",
    "Day-Rooms"
  ];

  helperIcon = 'assets/images/help.png';

  exceptionValues = [
    { 1: 97, 8: 98, 10: 95, 14: 90, 17: 95, 26: 90 },
    { 1: 2, 10: 1, 14: 1, 26: 1, 8: 4, 17: 2 },
    { 1: 1, 31: 4, 2: 2, 5: 2, 6: 1, 10: 1, 11: 2, 17: 1, 23: 1, 24: 1 },
    { 1: 4, 2: 2, 5: 1 },
    { 1: 2, 6: 7, 9: 1 },
    { 1: 3, 2: 6, 3: 6, 4: 2, 5: 6, 6: 4, 7: 6, 8: 6, 9: 6, 10: 2, 11: 2, 12: 10, 13: 11, 14: 6, 15: 6, 16: 8, 17: 6, 18: 6, 19: 6, 20: 6, 21: 7, 22: 6, 23: 6, 24: 6, 25: 8, 26: 6, 27: 6, 28: 6, 29: 6 }
  ];

  exceptionRows = this.exceptionTitles.map((title, idx) =>
    new ExceptionRow(title, this.helperIcon, this.exceptionValues[idx])
  );

  model: ExceptionModel = new ExceptionModel("May", 30, this.exceptionRows);

  constructor() { }
  private readonly dialog = inject(MatDialog);
  ngOnInit(): void { }
  onButtonClick(day: number): void {
    this.dialog.open(AiAuditComponent);
  }
}
