import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import {TicketsListPage} from '@app/tab1/components/tickets-list/tickets-list.page';
import {Tab2PageModule} from '@app/tab2/tab2.module';
import {NgbDatepickerModule, NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {CreateTicketComponent} from '@app/tab1/components/create-ticket/create-ticket.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MAT_DATE_FORMATS, MatNativeDateModule} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {TicketEditComponent} from "@app/tab1/components/ticket-edit/ticket-edit.component";
import {CallNumber} from "@awesome-cordova-plugins/call-number/ngx";

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        Tab1PageRoutingModule,
        Tab2PageModule,
        NgbDropdownModule,
        NgbDatepickerModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
  declarations: [Tab1Page, TicketsListPage, CreateTicketComponent, TicketEditComponent],
  exports: [TicketsListPage, CreateTicketComponent, TicketEditComponent],
  providers: [
    MatDatepickerModule,
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    CallNumber,
  ]
})
export class Tab1PageModule {}
