import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {filter, finalize, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LoadingController, PickerColumnOption, PickerController, ToastController} from '@ionic/angular';
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
  public addStartDayForm: FormGroup;

  public availableDays: PickerColumnOption[] = [
    { text: 'Nedelja', value: 0},
    { text: 'Ponedeljak', value: 1},
    { text: 'Utorak', value: 2},
    { text: 'Srijeda', value: 3},
    { text: 'Četvrtak', value: 4},
    { text: 'Petak', value: 5},
    { text: 'Subota', value: 6},
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
    this.addStartDayForm = this.fb.group({
      day: this.fb.control(null, Validators.required),
      time: this.fb.control('', Validators.required),
    });
  }

  public isDayIsUsed(selectedDay: number): boolean {
    let usedDays: number[] = this.busLineDays.value.map((item: any) => item.day);
    if(usedDays.some((day: number) => day === selectedDay)) {
      return true;
    }
    return false;

  }

  public createForm(): FormGroup {
    return this.fb.group({
      lineCityStart: this.fb.control('', Validators.required),
      lineCityEnd: this.fb.control('', Validators.required),
      linePriceOneWay: this.fb.control('', Validators.required),
      linePriceRoundTrip: this.fb.control('', Validators.required),
      lineCountryStart: this.fb.control('bih', Validators.required),
      lineArray: this.fb.array([], Validators.required),
    });
  }

  public get busLineDays(): FormArray {
    return <FormArray>this.createBusLineForm.controls['lineArray'];
  }

  public addBusLineDay(): void {
    const add = this.createBusLineForm.get('lineArray') as FormArray;
    if(this.addStartDayForm.valid) {
      add.push(this.fb.group(this.addStartDayForm.value));
    }

    this.addStartDayForm.reset();
    this.presentToast('Polazak dodan.')
  }

  public removeBusLineDay(index: number): void {
    const remove = this.createBusLineForm.get('lineArray') as FormArray;
    remove.removeAt(index);
    this.presentToast('Polazak obrisan.')
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  public createBusLine(): void {
    this.handleButtonClick();

    this.busLineService.createBusLine(this.createBusLineForm.value).pipe(
      take(1),
      filter((data) => !!data && this.createBusLineForm.valid),
      finalize(() => {
        this.loadingCtrl.dismiss();
        this.createBusLineForm.reset();
        this.presentToast('Linija uspjesno kreirana.');
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
