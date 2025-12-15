import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('login', 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('login');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('login') === 'true';
  }
}
