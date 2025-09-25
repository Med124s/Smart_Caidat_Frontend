import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TableFilterService {
  searchField = signal<string>('');   // فلترة بالكلمة
  statusField = signal<string>('');   // فلترة بالstatus
  typeField = signal<string>('');     // فلترة بالtype ✅
  orderField = signal<string>('');    // للترتيب

  constructor() {}
}
