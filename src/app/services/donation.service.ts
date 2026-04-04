import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://localhost:3000/api/donations';

  constructor(private http: HttpClient) {}

  addMonetaryDonation(donation: { amount: number, donorName: string, donorPhone?: string, donorEmail?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/monetary`, donation);
  }

  addPledge(pledge: { donorName: string, donorPhone?: string, donorEmail?: string, items: string[], center: string, dropOffDate?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/pledge`, pledge);
  }
}
