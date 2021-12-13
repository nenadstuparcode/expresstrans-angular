import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-configuration-list',
  templateUrl: './configuration-list.component.html',
  styleUrls: ['./configuration-list.component.scss'],
})
export class ConfigurationListComponent {

  public techs: any[] = [
    {
      title: 'linije',
      icon: 'bus-sharp',
      description: 'A powerful Javascript framework for building single page apps. Angular is open source, and maintained by Google.',
      color: '#E63135'
    }
  ];
  constructor(private router: Router) {}

  public showDetail(title: string): void {
    this.router.navigate([`/konfiguracija/${title}`]);
  }

}
