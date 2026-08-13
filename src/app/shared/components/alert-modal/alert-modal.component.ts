import { Router } from '@angular/router';
import { Component, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
})
export class AlertModalComponent implements AfterViewInit {
  @Input() message?: string;
  @Input() isSuccess: boolean = true; // ✅ Add this input
  @Input() size?: string;
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  constructor(private modal: NgbModal, public router: Router, public activeModal: NgbActiveModal) { }

  ngAfterViewInit(): void {
    this.focusModal();
    // Auto close after 5 seconds
    setTimeout(() => {
      this.activeModal.close(true);
    }, 5000);
  }

  closeDialog(): void {
    this.activeModal.close(true);
  }

  onEnterPress(CloseBtn: HTMLButtonElement): void {
    CloseBtn.click();
    CloseBtn.focus();
  }

  focusModal(): void {
    if (this.modalContainer) {
      this.modalContainer.nativeElement.focus();
    }
  }
}