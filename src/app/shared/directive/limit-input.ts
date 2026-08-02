import { Directive, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[limitInput]',
})
export class LimitInputDirective {
  @Input('limitInput') maxLength!: number | string;

  constructor(@Optional() @Self() private control: NgControl | null) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limit = Number(this.maxLength);
    if (input.value.length > limit) {
      const trimmedValue = input.value.substring(0, limit);
      input.value = trimmedValue;
      this.control?.control?.setValue(trimmedValue, { emitEvent: false });
      event.preventDefault();
      event.stopPropagation();
    }
  }
}