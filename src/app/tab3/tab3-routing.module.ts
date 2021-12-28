import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';
import {AuthGuard} from "@app/services/auth-guard";
import {UserDetailComponent} from "@app/tab3/components/user-detail/user-detail.component";

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'korisnik',
        canActivate: [AuthGuard],
      },
      {
        path: 'korisnik',
        component: UserDetailComponent,
        canActivate: [AuthGuard],

      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
