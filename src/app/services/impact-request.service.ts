import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RequestItem {
    name: string;
    quantity: number;
    status: 'pending' | 'partially-fulfilled' | 'fulfilled' | 'received';
    fulfilledBy?: string[];
}

export interface ImpactRequest {
    id: string;
    requesterName: string;
    location: string; // Parish name
    lat: number;
    lng: number;
    items: RequestItem[];
    timestamp: number;
}

export const PARISH_COORDS: { [key: string]: { lat: number, lng: number } } = {
    'Kingston': { lat: 17.9714, lng: -76.7936 },
    'St. Andrew': { lat: 18.0441, lng: -76.8041 },
    'St. Catherine': { lat: 18.0167, lng: -76.9500 },
    'Clarendon': { lat: 17.9667, lng: -77.2167 },
    'Manchester': { lat: 18.0333, lng: -77.5000 },
    'St. Elizabeth': { lat: 18.0500, lng: -77.7500 },
    'Westmoreland': { lat: 18.2333, lng: -78.1667 },
    'Hanover': { lat: 18.4167, lng: -78.1333 },
    'St. James': { lat: 18.4500, lng: -77.8833 },
    'Trelawny': { lat: 18.3833, lng: -77.5500 },
    'St. Ann': { lat: 18.3500, lng: -77.2833 },
    'St. Mary': { lat: 18.3000, lng: -76.9667 },
    'Portland': { lat: 18.1333, lng: -76.4833 },
    'St. Thomas': { lat: 17.9333, lng: -76.4333 }
};

@Injectable({
    providedIn: 'root'
})
export class ImpactRequestService {
    private apiUrl = 'http://localhost:3000/api/requests';
    private requestsSubject = new BehaviorSubject<ImpactRequest[]>([]);
    public requests$ = this.requestsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadRequests();
    }

    private loadRequests() {
      // Fetch from backend
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (rows) => {
          const reqs = rows.map(r => ({
            id: r.id.toString(),
            requesterName: r.requesterName,
            location: r.location,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lng),
            items: JSON.parse(r.items),
            timestamp: new Date(r.createdAt).getTime()
          }));
          this.requestsSubject.next(reqs);
        },
        error: () => {
          // Fallback to mock if API fails
          console.warn('Using mock requests - backend unreachable');
          this.requestsSubject.next([{
            id: 'mock-1',
            requesterName: 'Pam',
            location: 'St. Elizabeth',
            lat: PARISH_COORDS['St. Elizabeth'].lat,
            lng: PARISH_COORDS['St. Elizabeth'].lng,
            items: [{ name: 'Rice', quantity: 5, status: 'pending' }],
            timestamp: Date.now()
          }]);
        }
      });
    }

    addRequest(request: ImpactRequest) {
      this.http.post(this.apiUrl, request).subscribe(() => this.loadRequests());
    }

    updateRequest(updatedRequest: ImpactRequest) {
      this.http.put(`${this.apiUrl}/${updatedRequest.id}`, { items: updatedRequest.items }).subscribe(() => this.loadRequests());
    }

    getRequests(): ImpactRequest[] {
        return this.requestsSubject.value;
    }
}
