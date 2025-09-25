import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorrespondanceComponent } from './correspondance.component';

const routes: Routes = [
  {
    path: '',
    component: CorrespondanceComponent,
    children: [
      { path: '', redirectTo: 'correspondances', pathMatch: 'full' },
      { path: 'table', component: CorrespondanceComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorrespondanceRoutingModule {}
