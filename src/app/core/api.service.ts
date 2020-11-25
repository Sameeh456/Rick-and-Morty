import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  searchUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) { }

  getResponseFromUrl(url, queryParams = {}) {
    return this.http.get(url, {
      params: new HttpParams({
        fromObject: queryParams
      })
    });
  }
}
