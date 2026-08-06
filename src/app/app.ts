import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { 
  NgxUiLoaderModule, 
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule 
} from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgxUiLoaderModule,
    NgxUiLoaderRouterModule, // For router loading
    NgxUiLoaderHttpModule    // For HTTP loading
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ERP-Front');
}