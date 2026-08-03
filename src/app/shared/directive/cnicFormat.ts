import { Directive, ElementRef, HostListener } from '@angular/core';
import { DialogService } from '../../core/services/DialogService';

@Directive({
  selector: '[cnicFormat]',
  standalone: true
})
export class cnicFormat {

  constructor(private el: ElementRef<HTMLInputElement>, private dialogService: DialogService) { }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    const cnicValue = input.value.trim();

    if (!cnicValue) {
      return;
    }

    // CNIC must be exactly 13 digits
    if (cnicValue.length !== 13 || !/^\d{13}$/.test(cnicValue)) {
      this.dialogService.alertBox('CNIC length must be 13 digits.');
      input.value = '';
      input.focus();
      return;
    }

    const invalidPatterns = [
      /^(\d)\1{12}$/,        // all same digits
      /^1234567891011$/,     // sequential
      /^9876543210123$/,
      /^1234567890123$/
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(cnicValue)) {
        this.dialogService.alertBox('CNIC number is invalid due to sequential or repetitive patterns.');
        input.value = '';
        input.focus();
        return;
      }
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }
}