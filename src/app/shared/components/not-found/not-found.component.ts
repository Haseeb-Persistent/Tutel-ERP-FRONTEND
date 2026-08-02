import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    imports:[CommonModule],
    standalone: true
})
export class NotFoundComponent implements OnInit {
  isLoginButtonShow: boolean = true;
  constructor(
    private modal: NgbModal,
    public router: Router) { }

  ngOnInit(): void {
    this.modal.dismissAll()
    const currentRoute = this.router.url;
    if (currentRoute.split('/').find(part => part === 'app')) {
      this.isLoginButtonShow = false;
    } else {
      this.isLoginButtonShow = true;
    }
  }
}
