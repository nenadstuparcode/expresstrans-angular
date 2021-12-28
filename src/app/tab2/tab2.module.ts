import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { BusLinesComponent } from '@app/tab2/components/bus-lines/bus-lines.component';
import { ConfigurationListComponent } from '@app/tab2/components/configuration-list/configuration-list.component';
import { BusLineEditComponent } from '@app/tab2/components/bus-line-edit/bus-line-edit.component';
import { BusLineCreateComponent } from '@app/tab2/components/bus-line-create/bus-line-create.component';
import { BusLineService } from '@app/tab2/bus-line.service';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, Tab2PageRoutingModule, ReactiveFormsModule],
  exports: [BusLinesComponent, ConfigurationListComponent, BusLineEditComponent, BusLineCreateComponent],
  declarations: [Tab2Page, BusLinesComponent, ConfigurationListComponent, BusLineEditComponent, BusLineCreateComponent],
  providers: [BusLineService],
})
export class Tab2PageModule {}
