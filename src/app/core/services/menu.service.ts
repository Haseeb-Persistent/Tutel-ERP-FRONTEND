// Services/menu.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Menu } from '../models/menu.model';
import { ApiResponse } from '../models/auth.models';



@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Single getMenus method
  getMenus(): Observable<ApiResponse<Menu[]>> {
    return this.http.get<ApiResponse<Menu[]>>(`${this.apiUrl}/Menu/GetMenu`);
  }
}