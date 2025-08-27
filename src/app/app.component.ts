import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './core/services/theme.service';
import { ResponsiveHelperComponent } from './shared/components/responsive-helper/responsive-helper.component';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { ToastService } from './shared/toast/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster,NgClass],
})
export class AppComponent implements OnInit {
  title = 'Smart Caidat';
  public themeService = inject(ThemeService);
  public toastService = inject(ToastService);

    ngOnInit(): void {
      this.configDayJs()
      // this.toastService.show("Hello dear","SUCCESS")
  }
    private configDayJs() {
    dayjs.extend(relativeTime);
  }

}
