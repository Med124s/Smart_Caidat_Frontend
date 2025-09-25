import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalleComponent } from './salle.component';

const routes: Routes = [
  {
    path: '',
    component: SalleComponent,
    children: [
      { path: '', redirectTo: 'salles', pathMatch: 'full' },
      { path: 'table', component: SalleComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalleRoutingModule {}
