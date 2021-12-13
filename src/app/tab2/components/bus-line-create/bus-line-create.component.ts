import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {filter, finalize, takeUntil, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LoadingController, PickerColumn, PickerColumnOption, PickerController, ToastController} from '@ionic/angular';
import {BusLineService} from "@app/tab2/bus-line.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-bus-line-create',
  templateUrl: './bus-line-create.component.html',
  styleUrls: ['./bus-line-create.component.scss'],
})
export class BusLineCreateComponent implements OnInit, OnDestroy {

  private componentDestroyed$: Subject<void> = new Subject<void>();
  public createBusLineForm: FormGroup;

  public dayOneStartAt: PickerColumnOption[] = [
    { text: 'Ponedeljak', value: 0},
    { text: 'Utorak', value: 1},
    { text: 'Srijeda', value: 2},
    { text: 'Četvrtak', value: 3},
    { text: 'Petak', value: 4},
    { text: 'Subota', value: 5},
    { text: 'Nedelja', value: 6},
  ];

  public dayTwoStartAt: PickerColumnOption[] = [
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
    private pickerCtrl: PickerController,
    private busLineService: BusLineService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router) { }

  ngOnInit() {
    this.createBusLineForm = this.createForm();
  }

  public createForm(): FormGroup {
    return this.fb.group({
      lineCityStart: this.fb.control('', Validators.required),
      lineCityEnd: this.fb.control('', Validators.required),
      linePriceOneWay: this.fb.control('', Validators.required),
      linePriceRoundTrip: this.fb.control('', Validators.required),
      lineCountryStart: this.fb.control('bih', Validators.required),
      lineStartDay1: this.fb.control('1', Validators.required),
      lineStartDay2: this.fb.control('2', Validators.required),
      lineStartTime: this.fb.control('2', Validators.required),
    });
  }

  public getColumns(): PickerColumn[] {
    const options1: PickerColumn = {
      name: 'day1',
      selectedIndex: this.createBusLineForm.controls['lineStartDay1'].value ? this.createBusLineForm.controls['lineStartDay1'].value : 0,
      options: [...this.dayOneStartAt],
    };

    const options2: PickerColumn = {
      name: 'day2',
      selectedIndex: this.createBusLineForm.controls['lineStartDay2'].value ? this.createBusLineForm.controls['lineStartDay2'].value : 0,
      options: [...this.dayTwoStartAt]
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
            this.createBusLineForm.controls['lineStartDay1'].setValue(value.day1.value);
            this.createBusLineForm.controls['lineStartDay2'].setValue(value.day2.value);
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
      message: 'Linija uspjesno kreirana.',
      duration: 2000
    });
    toast.present();
  }

  public createBusLine(): void {
    this.handleButtonClick();

    this.busLineService.createBusLine(this.createBusLineForm.value).pipe(
      filter((data) => !!data && this.createBusLineForm.valid),
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
