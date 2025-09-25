import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MeetingComponent } from './meeting.component';

const routes: Routes = [
  {
    path: '',
    component: MeetingComponent,
    children: [
      { path: '', redirectTo: 'meetings', pathMatch: 'full' },
      { path: 'table', component: MeetingComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingRoutingModule {}
