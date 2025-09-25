import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { adminGuard } from 'src/app/core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: LayoutComponent,
    loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'users',
    component: LayoutComponent,
    loadChildren: () => import('../uikit/uikit.module').then((m) => m.UikitModule),
    canActivate:[adminGuard]
  },
  {
    path: 'citoyens',
    component: LayoutComponent,
    loadChildren: () => import('../citoyen/citoyen.module').then((m) => m.CitoyenModule),
    //canActivate:[adminGuard]
  },
  {
    path: 'document_management/archives',
    component: LayoutComponent,
    loadChildren: () => import('../documents_managements/archive_document/archive_documents.module').then((m) => m.ArchiveModule),
    //canActivate:[adminGuard]
  },
  {
    path: 'document_management/requests',
    component: LayoutComponent,
    loadChildren: () => import('../documents_managements/request/request_documents.module').then((m) => m.RequestModule),
    //canActivate:[adminGuard]
  },
  {
    path: 'reclamations',
    component: LayoutComponent,
    loadChildren: () => import('../complaint/complaints.module').then((m) => m.ComplaintsModule),
    //canActivate:[adminGuard]
  },
    {
    path: 'correspondances',
    component: LayoutComponent,
    loadChildren: () => import('../correspondance/correspondance.module').then((m) => m.CorrespondanceModule),
    //canActivate:[adminGuard]
  }, 
  {
    path: 'type-correspondances',
    component: LayoutComponent,
    loadChildren: () => import('../correspondance-type/type-correspondance.module').then((m) => m.TypeCorrespondanceModule),
    //canActivate:[adminGuard]
  },
  {
    path: 'tasks',
    component: LayoutComponent,
    loadChildren: () => import('../Task/task.module').then((m) => m.TaskModule),
    //canActivate:[adminGuard]
  }, 
  {
    path: 'meetings',
    component: LayoutComponent,
    loadChildren: () => import('../meeting/meeting.module').then((m) => m.MeetingModule),
    //canActivate:[adminGuard]
  },
  {
    path: 'salles',
    component: LayoutComponent,
    loadChildren: () => import('../salle/salle.module').then((m) => m.SalleModule),
    //canActivate:[adminGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
