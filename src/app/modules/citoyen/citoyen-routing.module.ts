import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CitoyenTableComponent } from './pages/table/table.component';

const routes: Routes = [
  {
    path: '',
    component: CitoyenTableComponent,
    children: [
      { path: '', redirectTo: 'citoyens', pathMatch: 'full' },
      { path: 'table', component: CitoyenTableComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitoyenRoutingModule {}
