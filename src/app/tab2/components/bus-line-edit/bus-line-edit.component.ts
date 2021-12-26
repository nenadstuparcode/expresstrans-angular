import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoadingController, PickerColumn, PickerColumnOption, PickerController, ToastController} from "@ionic/angular";
import {BusLineService} from "@app/tab2/bus-line.service";
import {concatMap, filter, finalize, map, take, takeUntil, tap} from "rxjs/operators";
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
      tap((data:any) => console.log(data)),
      tap((data: ICommonResponse<IBusLine>) => {
        this.updateBusLineForm = this.initiateUpdateForm(data.data);
        this.addStartDayForm = this.fb.group({
          day: this.fb.control(null, Validators.required),
          time: this.fb.control('', Validators.required),
        });
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public isDayIsUsed(selectedDay: number): boolean {
    let usedDays: number[] = this.busLineDays.value.map((item: any) => item.day);
    if(usedDays.some((day: number) => day === selectedDay)) {
      return true;
    }
    return false;
  }

  public initiateUpdateForm(busLine: IBusLine): FormGroup {
   return this.fb.group({
      lineCityStart: this.fb.control(busLine.lineCityStart, Validators.required),
      lineCityEnd: this.fb.control(busLine.lineCityEnd, Validators.required),
      linePriceOneWay: this.fb.control(busLine.linePriceOneWay, Validators.required),
      linePriceRoundTrip: this.fb.control(busLine.linePriceRoundTrip, Validators.required),
      lineCountryStart: this.fb.control(busLine.lineCountryStart, Validators.required),
      lineArray: this.fb.array([...busLine.lineArray], Validators.required),
    });
  }

  public get busLineDays(): FormArray {
    return <FormArray>this.updateBusLineForm.controls['lineArray'];
  }

  public addBusLineDay(): void {
    const add = this.updateBusLineForm.get('lineArray') as FormArray;
    if(this.addStartDayForm.valid) {
      add.push(this.fb.group(this.addStartDayForm.value));
    }

    this.addStartDayForm.reset();
    this.presentToast('Polazak dodan.')
  }

  public removeBusLineDay(index: number): void {
    const remove = this.updateBusLineForm.get('lineArray') as FormArray;
    remove.removeAt(index);
    this.presentToast('Polazak obrisan.');
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  public updateBusLine(): void {
    this.handleButtonClick();

    this.busLineService.updateBusLine(this.updateBusLineForm.value, this.busLineId).pipe(
      filter((data) => !!data && this.updateBusLineForm.valid),
      take(1),
      finalize(() => {
        this.loadingCtrl.dismiss();
        this.presentToast('Linija uspjesno uređena.');
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
