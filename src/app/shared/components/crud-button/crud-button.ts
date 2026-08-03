import { Component } from '@angular/core';
import { DialogService } from '../../../core/services/DialogService';

@Component({
  selector: 'app-crud-button',
  imports: [],
  templateUrl: './crud-button.html',
  styleUrl: './crud-button.css',
})
export class CrudButton {
constructor(private dialog:DialogService) { }

  onSave(){
this.dialog.alertBox("Are you sure you want to save this record?")

  }
  onUpdate(){}
  onReset(){}

}
