import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoadingController, PickerColumn, PickerColumnOption, PickerController, ToastController} from "@ionic/angular";
import {BusLineService} from "@app/tab2/bus-line.service";
import {concatMap, filter, finalize, map, takeUntil, tap} from "rxjs/operators";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ICommonResponse} from "@app/services/user.interface";
import {IBusLine} from "@app/tab2/tab2.interface";

@Component({
  selector: 'app-bus-line-edit',
  templateUrl: './bus-line-edit.component.html',
  styleUrls: ['./bus-line-edit.component.scss'],
})
export class BusLineEditComponent implements OnInit, OnDestroy {
  public busLine: IBusLine;
  private componentDestroyed$: Subject<void> = new Subject<void>();
  public updateBusLineForm: FormGroup;
  public busLineId: string;
  public optionsStart: PickerColumnOption[] = [
    { text: 'Ponedeljak', value: 0},
    { text: 'Utorak', value: 1},
    { text: 'Srijeda', value: 2},
    { text: 'Četvrtak', value: 3},
    { text: 'Petak', value: 4},
    { text: 'Subota', value: 5},
    { text: 'Nedelja', value: 6},
  ];
  public optionsEnd: PickerColumnOption[] = [
    { text: 'Ponedeljak', value: 0},
    { text: 'Utorak', value: 1},
    { text: 'Srijeda', value: 2},
    { text: 'Četvrtak', value: 3},
    { text: 'Petak', value: 4},
    { text: 'Subota', value: 5},
    { text: 'Nedelja', value: 6},
  ];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private pickerCtrl: PickerController,
    private busLineService: BusLineService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router) { }

  public ngOnInit(): void {
    this.activatedRoute.params.pipe(
      filter((data: Params) => !!data),
      tap((data:Params) => this.busLineId = data.id),
      concatMap(() => this.busLineService.getBusLine(this.busLineId)),
      tap((data: ICommonResponse<IBusLine>) => this.updateBusLineForm = this.initiateUpdateForm(data.data)),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public initiateUpdateForm(busLine: IBusLine): FormGroup {
   return this.fb.group({
      lineCityStart: this.fb.control(busLine.lineCityStart, Validators.required),
      lineCityEnd: this.fb.control(busLine.lineCityEnd, Validators.required),
      linePriceOneWay: this.fb.control(busLine.linePriceOneWay, Validators.required),
      linePriceRoundTrip: this.fb.control(busLine.linePriceRoundTrip, Validators.required),
      lineStartTime: this.fb.control(busLine.lineStartTime, Validators.required),
      lineCountryStart: this.fb.control(busLine.lineCountryStart, Validators.required),
      lineStartDay1: this.fb.control(busLine.lineStartDay1, Validators.required),
      lineStartDay2: this.fb.control(busLine.lineStartDay2, Validators.required),
    })
  }

  public getColumns(): PickerColumn[] {
    const options1: PickerColumn = {
      name: 'day1',
      selectedIndex: this.updateBusLineForm.controls['lineStartDay1'].value ? this.updateBusLineForm.controls['lineStartDay1'].value : 0,
      options: [...this.optionsStart],
    };

    const options2: PickerColumn = {
      name: 'day2',
      selectedIndex: this.updateBusLineForm.controls['lineStartDay2'].value ? this.updateBusLineForm.controls['lineStartDay2'].value : 0,
      options: [...this.optionsEnd]
    };

    return [options1, options2];
  }

  async openPicker() {
    const picker = await this.pickerCtrl.create({
      buttons: [
        {
          text: 'Odustani',
          role: 'cancel',
        },
        {
          text: 'Potvrdi',
          handler: (value) => {
            console.log(value);
            this.updateBusLineForm.controls['lineStartDay1'].setValue(value.day1.value);
            this.updateBusLineForm.controls['lineStartDay2'].setValue(value.day2.value);
          },
        },
      ],
      columns: this.getColumns(),
    });

    await picker.present();

    picker.onDidDismiss().then( async data => {
      picker.columns.forEach((column) => {
        column.options.forEach((el) => {
          delete el.selected;
          delete el.disabled;
          delete el.transform;
        })
      })
    })
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Linija uspjesno uređena.',
      duration: 2000
    });
    toast.present();
  }

  public updateBusLine(): void {
    this.handleButtonClick();

    this.busLineService.updateBusLine(this.updateBusLineForm.value, this.busLineId).pipe(
      filter((data) => !!data && this.updateBusLineForm.valid),
      finalize(() => {
        this.loadingCtrl.dismiss();
        this.presentToast();
        this.router.navigate(['/konfiguracija/linije']);
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  async handleButtonClick() {
    const loading = await this.loadingCtrl.create({
      message: 'Kreiranje Linije...',
      duration: 1000,
    });

    await loading.present();
  }

  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
