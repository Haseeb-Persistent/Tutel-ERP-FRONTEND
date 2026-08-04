// shared/components/loader/loader.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from './../../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  loading$: Observable<boolean>;
  
  constructor(private loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
  }
}