import { Component } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private popoverCtrl: PopoverController) {}

  public showPopover(event) {

  }
}
