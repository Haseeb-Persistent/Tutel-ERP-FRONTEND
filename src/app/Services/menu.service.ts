// Services/menu.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../model/menu.model';
import { environment } from '../../environments/environment.development';

export interface ApiResponse {
  responseCode: number;
  data: Menu[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Single getMenus method
  getMenus(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/Menu/GetMenu`);
  }
}