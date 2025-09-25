import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public users: string[] = ['Utilisateur 1', 'Utilisateur 3', 'Utilisateur 2'];
  public organisms: string[] = ['Organisme 1', 'Organisme 3', 'Organisme 2'];
}
