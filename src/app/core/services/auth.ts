import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:3000/users';
  deleteUserAccount: any;
  getAllUsers: any;

  constructor(private http: HttpClient) {}

  // SIGNUP
  signup(user: any): Observable<any> {
    return this.http.post(this.api, user);
  }

  // LOGIN
  login(email: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  // SAVE USER
  saveUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  

  // GET USER
  getUser(): any {

  if (typeof window !== 'undefined') {

    return JSON.parse(
      localStorage.getItem('currentUser') || 'null'
    );

  }

  return null;

}
  // CHECK LOGIN
  isLoggedIn(): boolean {
  return !!localStorage.getItem('currentUser');
}

  // CHECK ADMIN
  isAdmin(): boolean {

    const user = this.getUser();

    return user && user.role === 'admin';
  }

  // LOGOUT
  logout() {

  if (typeof window !== 'undefined') {

    localStorage.removeItem('currentUser');

  }

}

}