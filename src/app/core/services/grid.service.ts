import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/ApiResponce';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  // ✅ Points to your CountryController which hosts the dynamic endpoints
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * ✅ UNIVERSAL METHOD: Fetch Grid Data for ANY form
   * @param formName - The entity name (e.g., 'Country', 'Company', 'User')
   * @returns Observable of dynamic array
   */
  getGridData(formName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/DynamicGrid/${formName}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * ✅ UNIVERSAL METHOD: Fetch a Single Record by ID for ANY form
   * @param formName - The entity name (e.g., 'Country', 'Company', 'User')
   * @param id - The record ID
   * @returns Observable of a dynamic object
   */
  getRecordById(formName: string, id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/record/${formName}/${id}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * ✅ (Optional) Generic Create Method
   * If all your forms use the same controller for CRUD, you can make this generic too.
   */
  createRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}`, data).pipe(
      map(res => res.data)
    );
  }

  /**
   * ✅ (Optional) Generic Update Method
   */
  updateRecord(formName: string, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}`, data).pipe(
      map(res => res.data)
    );
  }

  /**
   * ✅ (Optional) Generic Delete Method
   */
  deleteRecord(formName: string, id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(res => { return; })
    );
  }
}