import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../shared/components/alert-modal/alert-modal.component';
import { ConfirmDialog } from '../shared/components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private modalService: NgbModal) { }


  public alertBox(message: string): Promise<boolean> {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true, keyboard: false, animation: true, backdrop: "static" });
    modalRef.componentInstance.message = message;

    setTimeout(() => {
      const modalElement = modalRef.componentInstance.modalContainer.nativeElement;
      modalElement.focus();
    }, 0);

    return modalRef.result;
  }

  public confirmBox(DispMsg: any, title: string = "") {
    let modalOptions: NgbModalOptions;
    modalOptions = { size: 'md', backdrop: 'static', keyboard: false, animation: true, centered: true };
    const modalRef = this.modalService.open(ConfirmDialog, modalOptions);
    modalRef.componentInstance.DispMsg = DispMsg;
    modalRef.componentInstance.title = title == "" ? "Alert" : title;
    return modalRef.result;
  }

}
