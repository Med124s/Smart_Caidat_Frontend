import {Injectable} from '@angular/core';
import {ToastInfo} from "./toast-info.model";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: ToastInfo[] = [];

  constructor() { }

  show(body: string, type: "SUCCESS" | "DANGER") {
    let className;
    if(type === "DANGER") {
      className = "bg-red-500 text-light";
    } else {
      className = "bg-green-500 text-light";
    }
    const toastInfo: ToastInfo = {body, className};
    this.toasts.push(toastInfo);

     // Auto-hide after 3s
    setTimeout(() => this.remove(toastInfo), 3000);

  }

  remove(toast: ToastInfo): void {
    this.toasts = this.toasts.filter(toastToCompare => toastToCompare != toast);
  }
}
