import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Participant {
  id?: number;
  name: string;
  email: string;
  phone: string;
  level: string;
  days: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private base = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/participants`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/participants/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(`${this.base}/participants`, payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.base}/participants/${id}`, payload);
  }

  delete(id: number) {
  return this.http.delete<void>(`${this.base}/participants/${id}`);
}
  
}