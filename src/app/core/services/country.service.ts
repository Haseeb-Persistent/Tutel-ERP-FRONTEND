import { Country, CountryRequest } from './../models/country.model';
import { environment } from './../../../environments/environment.development';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/ApiResponce';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = `${environment.apiUrl}/Country`; // Matches [Route("api/[controller]")]

  constructor(private http: HttpClient) { }

   getGridData(formName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/grid/${formName}`).pipe(
      map(res => res.data)
    );
  }

  // GET: Single Record
  getRecordById(formName: string, id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/record/${formName}/${id}`).pipe(
      map(res => res.data)
    );
  }




  

  // POST: Insert
  insertRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/insert`, data).pipe(
      map(res => res.data)
    );
  }

  // PUT: Update
  updateRecord(formName: string, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/update`, data).pipe(
      map(res => res.data)
    );
  }

  // POST: Reject
  rejectRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/reject`, data).pipe(
      map(res => res.data)
    );
  }

  // POST: Authorize
  authorizeRecord(formName: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/authorize`, data).pipe(
      map(res => res.data)
    );
  }

  // GET: View Changes
  viewChanges(formName: string, id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/viewchanges/${id}`).pipe(
      map(res => res.data)
    );
  }
}