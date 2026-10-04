import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiFeedbackService {
  error = signal('');
  pendingWrites = signal(0);
}
