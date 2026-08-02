import { Router } from '@angular/router';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
})
export class AlertModalComponent {
 @Input() message?: string
  @Input() size?: string
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  constructor(private modal: NgbModal, public router: Router, public activeModal: NgbActiveModal) { }

  ngAfterViewInit(): void {
    this.focusModal();
  }

  closeDialog(): void {
    this.activeModal.close(true);
    // window.history.back();
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
