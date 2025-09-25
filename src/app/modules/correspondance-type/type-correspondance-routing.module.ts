import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TypeCorrespondanceComponent } from './type-correspondance.component';

const routes: Routes = [
  {
    path: '',
    component: TypeCorrespondanceComponent,
    children: [
      { path: '', redirectTo: 'type-correspondances', pathMatch: 'full' },
      { path: 'table', component: TypeCorrespondanceComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypeCorrespondanceRoutingModule {}
