import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  public tireWidthImageUrl: string = 'assets/images/tire_width.png';
  public tireHeightImageUrl: string = 'assets/images/tire_img.png';

  constructor() { }

  ngOnInit() {}

  public segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

}
