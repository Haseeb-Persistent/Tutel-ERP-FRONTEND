import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../core/services/DialogService';

@Component({
  selector: 'app-crud-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-button.html',
  styleUrl: './crud-button.css',
})
export class CrudButton {
  constructor(private dialog: DialogService) {}

  // --- INPUTS to control which buttons appear ---
  @Input() showSave: boolean = true;
  @Input() showUpdate: boolean = false;
  @Input() showAuthorize: boolean = false;
  @Input() showReject: boolean = false;
  @Input() showReset: boolean = true;
  @Input() showViewChanges: boolean = false;
  @Input() showBack: boolean = true;

  // --- OUTPUTS to send events back to the parent ---
  @Output() onSave = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();
  @Output() onAuthorize = new EventEmitter<void>();
  @Output() onReject = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onViewChangeHistory = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();

  // --- Button Click Handlers ---
  handleSave() {
    this.dialog.alertBox("Are you sure you want to save this record?").then((result) => {
      if (result) {
        this.onSave.emit();
      }
    });
  }

  handleUpdate() {
    this.dialog.alertBox("Are you sure you want to update this record?").then((result) => {
      if (result) {
        this.onUpdate.emit();
      }
    });
  }

  // ✅ FIXED: Now subscribes correctly to the Promise
  handleReset() {
    this.dialog.alertBox("Are you sure you want to reset this record?").then((result) => {
      if (result) {
        this.onReset.emit();
      }
    });
  }

  handleBack() {
    this.onBack.emit();
  }
}