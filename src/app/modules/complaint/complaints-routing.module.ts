import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplaintsTableComponent } from './pages/table/table.component';

const routes: Routes = [
  {
    path: '',
    component: ComplaintsTableComponent,
    // children: [
    //   { path: '', redirectTo: 'archives', pathMatch: 'full' },
    //   { path: 'archives', component: ArchiveTableComponent },
    //   { path: '**', redirectTo: 'errors/404' },
    // ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComplaintsRoutingModule {}
