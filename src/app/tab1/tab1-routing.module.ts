import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';
import { TicketsListPage } from '@app/tab1/components/tickets-list/tickets-list.page';
import {AuthGuard} from "@app/services/auth-guard";

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'karte',
        canActivate: [AuthGuard],
      },
      {
        path: 'karte',
        component: TicketsListPage,
        canActivate: [AuthGuard],
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
