import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  idNumber: string;
  name: string;
  role: 'survivor' | 'admin' | 'agent';
  weight?: string;
  emergencyContact?: string;
  bloodType?: string;
  currentMedications?: string;
  medicalConditions?: string;
  allergies?: string;
  preferredDoctorName?: string;
  doctorContactNumber?: string;
  dob?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/survivors';

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('survivor_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred. Please ensure the backend server is running on port 3000.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // The backend returns { error: 'message' } or { message: 'message' }
      errorMessage = error.error?.error || error.error?.message || `Server Status ${error.status}: ${error.message}`;
    }
    console.error('AuthService Error:', errorMessage);
    return throwError(() => errorMessage);
  }

  login(identifier: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { identifier, password })
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('survivor_user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  register(survivorData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, survivorData)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('survivor_user');
    this.currentUserSubject.next(null);
  }

  resetPassword(identifier: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { identifier, newPassword })
      .pipe(catchError(this.handleError));
  }

  updateUser(updatedData: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const newUser = { ...current, ...updatedData } as User;
      localStorage.setItem('survivor_user', JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
    }
  }
}


