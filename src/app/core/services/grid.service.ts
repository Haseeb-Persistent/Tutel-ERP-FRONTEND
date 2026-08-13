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
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // ─── GRID DATA ──────────────────────────────────────────────────────
  getGridData(formName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${formName}/grid/${formName}`).pipe(
      map(res => res.data)
    );
  }

  // ─── SINGLE RECORD ──────────────────────────────────────────────────
  getRecordById(formName: string, rowId: string): Observable<any> {
    const id = parseInt(rowId, 10);
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${formName}/record/${id}`).pipe(
      map(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data[0];
        }
        return null;
      })
    );
  }

GettAllOptions(formName: string, rowId: string): Observable<any> {
  const id = parseInt(rowId, 10);
  return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${formName}/record/${id}`).pipe(
    map(res => {
      if (res && res.data) {
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data[0];
        }
        return res.data;
      }
      return null;
    })
  );
}
  // ─── INSERT RECORD ──────────────────────────────────────────────────
  insertRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${formName}/insertRecord`, data).pipe(
      map(res => {
        // ✅ Return full response with message
        return {
          isSuccess: res.isSuccess || false,
          message: res.message || '',
          data: res.data
        };
      })
    );
  }

  // ─── UPDATE RECORD ──────────────────────────────────────────────────
  updateRecord(formName: string, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${formName}/updateRecord`, data).pipe(
      map(res => {
        return {
          isSuccess: res.isSuccess || false,
          message: res.message || '',
          data: res.data
        };
      })
    );
  }

  // ─── DELETE RECORD ──────────────────────────────────────────────────
  deleteRecord(formName: string, id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${formName}/deleteRecord/${id}`).pipe(
      map(res => {
        // ✅ Return full response with message
        return {
          isSuccess: res.isSuccess || false,
          message: res.message || '',
          data: res.data
        };
      })
    );
  }
}