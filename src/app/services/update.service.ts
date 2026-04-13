import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertUpdate {
    id: string;
    title: string;
    source: string;
    time: string;
    content: string;
    status: 'info' | 'warning' | 'danger';
}

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private updatesSubject = new BehaviorSubject<AlertUpdate[]>([
        {
            id: '1',
            title: 'Early Wet Season Outlook',
            source: 'Jamaica Meteorological Service',
            time: 'April 13, 2026 - 9:45 AM',
            content: 'Projection for April/May shows below-normal rainfall. Isolated afternoon thunderstorms expected in northern and inland parishes. Daytime highs: 32°C.',
            status: 'info'
        },
        {
            id: '2',
            title: 'Hydration & Heat Advisory',
            source: 'ODPEM',
            time: 'Ongoing',
            content: 'Due to rising temperatures and dry conditions, residents are advised to conserve water and ensure vulnerable seniors remain hydrated.',
            status: 'warning'
        }
    ]);
    public updates$ = this.updatesSubject.asObservable();

    addUpdate(update: Omit<AlertUpdate, 'id' | 'time'>) {
        const newUpdate: AlertUpdate = {
            ...update,
            id: Date.now().toString(),
            time: new Date().toLocaleString()
        };
        const current = this.updatesSubject.value;
        this.updatesSubject.next([newUpdate, ...current]);
    }

    updateUpdate(updatedUpdate: AlertUpdate) {
        const current = this.updatesSubject.value;
        const index = current.findIndex(u => u.id === updatedUpdate.id);
        if (index !== -1) {
            const nextUpdates = [...current];
            nextUpdates[index] = {
                ...updatedUpdate,
                time: `Last Revised: ${new Date().toLocaleString()}`
            };
            this.updatesSubject.next(nextUpdates);
        }
    }

    deleteUpdate(id: string) {
        const filtered = this.updatesSubject.value.filter(u => u.id !== id);
        this.updatesSubject.next(filtered);
    }
}
