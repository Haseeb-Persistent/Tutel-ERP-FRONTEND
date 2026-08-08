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
  // ✅ Base API URL
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // ─── GRID DATA ──────────────────────────────────────────────────────
  // URL: /api/{formName}/grid/{formName}
  // Example: /api/Country/grid/Country
  getGridData(formName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${formName}/grid/${formName}`).pipe(
      map(res => res.data)
    );
  }

  // ─── SINGLE RECORD ──────────────────────────────────────────────────
  // URL: /api/{formName}/record/{id}
  // Example: /api/Country/record/5
// ─── SINGLE RECORD ──────────────────────────────────────────────────
// URL: /api/{formName}/record/{id}
// Example: /api/Country/record/5
// ─── SINGLE RECORD ──────────────────────────────────────────────────
getRecordById(formName: string, rowId: string): Observable<any> {
  const id = parseInt(rowId, 10);
  return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${formName}/record/${id}`).pipe(
    // ✅ FIX: Extract the first item from the array
    map(res => {
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0]; // Return the object, not the array
      }
      return null;
    })
  );
}

GettAllOptions(formName: string, rowId: string): Observable<any> {
  const id = parseInt(rowId, 10);
  return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${formName}/record/${id}`).pipe(
    // ✅ Extract the data object directly
    map(res => res.data)
  );
}
  // ─── INSERT RECORD ──────────────────────────────────────────────────
  // URL: /api/{formName}/insertRecord
  // Example: /api/Country/insertRecord
  insertRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${formName}/insertRecord`, data).pipe(
      map(res => res.data)
    );
  }

  // ─── UPDATE RECORD ──────────────────────────────────────────────────
  // URL: /api/{formName}/updateRecord
  // Example: /api/Country/updateRecord
  updateRecord(formName: string, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${formName}/updateRecord`, data).pipe(
      map(res => res.data)
    );
  }

  // ─── DELETE RECORD ──────────────────────────────────────────────────
  // URL: /api/{formName}/deleteRecord/{id}
  // Example: /api/Country/deleteRecord/5
  deleteRecord(formName: string, id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${formName}/deleteRecord/${id}`).pipe(
      map(res => res.data)
    );
  }
}