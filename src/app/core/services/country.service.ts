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
  private apiUrl = `${environment.apiUrl}/Country`; // Matches [Route("api/[controller]")]

  constructor(private http: HttpClient) { }

   getAll(formName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/grid/${formName}`).pipe(
      map(res => res.data)
    );
  }

  getActive(): Observable<Country[]> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/active`).pipe(
      map(res => res.data)
    );
  }

  getById(id: number): Observable<Country> {
    return this.http.get<ApiResponse<Country>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  checkExists(countryName: string, excludeId?: number): Observable<boolean> {
    let params = new HttpParams().set('countryName', countryName);
    if (excludeId !== null && excludeId !== undefined) {
      params = params.set('excludeId', excludeId.toString());
    }
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check-exists`, { params }).pipe(
      map(res => res.data)
    );
  }

  create(country: CountryRequest): Observable<Country> {
    return this.http.post<ApiResponse<Country>>(this.apiUrl, country).pipe(
      map(res => res.data)
    );
  }

  update(country: CountryRequest): Observable<Country> {
    return this.http.put<ApiResponse<Country>>(this.apiUrl, country).pipe(
      map(res => res.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        // Optional: You can check res.responseCode here if needed
        return;
      })
    );
  }
}