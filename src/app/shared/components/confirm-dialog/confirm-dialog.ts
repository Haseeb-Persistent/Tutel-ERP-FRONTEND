import { Component, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-Conf-dialog',
  templateUrl: './confirm-dialog.html',
  standalone: true
})

export class ConfirmDialog implements OnInit {

  @Input() title: string | undefined;
  @Input() DispMsg: string | undefined;
  @Output() IsConfrm: boolean = false;
  constructor(private modal: NgbModal, private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }
}
