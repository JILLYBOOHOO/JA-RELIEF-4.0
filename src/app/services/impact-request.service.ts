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
    status: 'Request Made' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Completed';
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

    private mockRequests: ImpactRequest[] = [];

    constructor(private http: HttpClient) {
        // Initialize mock data once
        const now = Date.now();
        this.mockRequests = [
            { id: 'mock-1', requesterName: 'Pam', location: 'St. Elizabeth', lat: PARISH_COORDS['St. Elizabeth'].lat, lng: PARISH_COORDS['St. Elizabeth'].lng, items: [{ name: 'Water', quantity: 1, status: 'pending' }], timestamp: now, status: 'Request Made' },
            { id: 'mock-2', requesterName: 'Ricardo', location: 'Kingston', lat: PARISH_COORDS['Kingston'].lat, lng: PARISH_COORDS['Kingston'].lng, items: [{ name: 'Syrup', quantity: 1, status: 'pending' }], timestamp: now - 300000, status: 'Request Made' },
            { id: 'mock-3', requesterName: 'Alicia', location: 'St. James', lat: PARISH_COORDS['St. James'].lat, lng: PARISH_COORDS['St. James'].lng, items: [{ name: 'Juice / Tin Juice', quantity: 2, status: 'pending' }], timestamp: now - 600000, status: 'Request Made' },
            { id: 'mock-4', requesterName: 'Marcus', location: 'Portland', lat: PARISH_COORDS['Portland'].lat, lng: PARISH_COORDS['Portland'].lng, items: [{ name: 'Rice / Flour', quantity: 1, status: 'pending' }], timestamp: now - 900000, status: 'Request Made' },
            { id: 'mock-5', requesterName: 'Tasha', location: 'Manchester', lat: PARISH_COORDS['Manchester'].lat, lng: PARISH_COORDS['Manchester'].lng, items: [{ name: 'Sugar / Cornmeal', quantity: 3, status: 'pending' }], timestamp: now - 1200000, status: 'Request Made' }
        ];
        this.loadRequests();
    }

    private loadRequests() {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (rows) => {
          const dynamicNames = ['Pam', 'Ricardo', 'Alicia', 'Marcus', 'Tasha', 'Leon', 'Maya', 'Omar'];
          const reqs: ImpactRequest[] = rows.map((r, i) => {
              // Try to find if we already have a status for this request in our local cache
              const existing = this.mockRequests.find(m => m.id === r.id.toString());
              return {
                  id: r.id.toString(),
                  requesterName: r.requesterName || dynamicNames[i % dynamicNames.length],
                  location: r.location,
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lng),
                  items: JSON.parse(r.items),
                  timestamp: new Date(r.createdAt).getTime(),
                  status: r.status || (existing ? existing.status : 'Request Made')
              };
          });
          
          // Sync our local mock cache with the fresh backend data (preserving status)
          this.mockRequests = [...reqs];
          this.requestsSubject.next(this.mockRequests);
        },
        error: () => {
          console.warn('Backend unreachable - using/retaining local state');
          this.requestsSubject.next([...this.mockRequests]);
        }
      });
    }

    addRequest(request: ImpactRequest) {
      this.mockRequests.unshift(request);
      this.requestsSubject.next([...this.mockRequests]);
      this.http.post(this.apiUrl, request).subscribe({
          next: () => this.loadRequests(),
          error: () => {} 
      });
    }

    updateRequest(updatedRequest: ImpactRequest) {
      // Update persistent local state
      this.mockRequests = this.mockRequests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
      this.requestsSubject.next([...this.mockRequests]);

      this.http.put(`${this.apiUrl}/${updatedRequest.id}`, { 
        items: updatedRequest.items,
        status: updatedRequest.status 
      }).subscribe({
        next: () => this.loadRequests(),
        error: () => console.warn('Update failed - kept local changes')
      });
    }

    getRequests(): ImpactRequest[] {
        return this.requestsSubject.value;
    }
}
