import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Participant {
  id: number;
  name: string;
  email?: string;
  level?: string;
  hari?: string;
  jam?: string;
  tanggal?: string;
}

@Injectable({ providedIn: 'root' })
export class ParticipantsService {
  private base = 'http://localhost:3000/api/participants';
  constructor(private http: HttpClient) {}

  list(): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Participant>(`${this.base}/${id}`);
  }

  create(payload: Partial<Participant>) {
    return this.http.post<Participant>(this.base, payload);
  }

  update(id: number, payload: Partial<Participant>) {
    return this.http.put<Participant>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
