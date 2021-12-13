import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';
import {BusLinesComponent} from '@app/tab2/components/bus-lines/bus-lines.component';
import {ConfigurationListComponent} from '@app/tab2/components/configuration-list/configuration-list.component';
import {BusLineEditComponent} from '@app/tab2/components/bus-line-edit/bus-line-edit.component';
import {BusLineCreateComponent} from '@app/tab2/components/bus-line-create/bus-line-create.component';
import {AuthGuard} from "@app/services/auth-guard";

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'lista',
        canActivate: [AuthGuard],
      },
      {
        path: 'lista',
        component: ConfigurationListComponent,
        canActivate: [AuthGuard],

      },
      {
        path: 'linije',
        component: BusLinesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'linije/uredi/:id',
        component: BusLineEditComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'linije/kreiraj',
        component: BusLineCreateComponent,
        canActivate: [AuthGuard],
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}
