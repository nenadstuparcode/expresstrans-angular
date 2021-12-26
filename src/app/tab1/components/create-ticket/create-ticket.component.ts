import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  LoadingController,
  ModalController,
  PickerColumn,
  PickerColumnOption,
  PickerController,
  ToastController
} from '@ionic/angular';
import {BusLineService} from "@app/tab2/bus-line.service";
import {filter, finalize, map, takeUntil, tap} from "rxjs/operators";
import {Subject} from "rxjs";
import {IBusLine} from "@app/tab2/tab2.interface";
import {MatDatepicker} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DateAdapter} from "@angular/material/core";
import {TicketService} from "@app/tab1/ticket.service";

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss'],

})
export class CreateTicketComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  public createTicketForm: FormGroup;

  public componentDestroyed$: Subject<void> = new Subject<void>();
  public minDate: Date;
  public columnOptions: PickerColumnOption[] = [];
  public pickedOption: any;
  public startTime: string = '';
  public availableDays: number[] = [];
  public daysForLine: any[] = [];


  myFilter = (d: Date): boolean => {
    const day = (d || new Date()).getDay();
    console.log(day);
    const blockedDates = [...this.availableDays];
    console.log(blockedDates);
    return (blockedDates.includes(day));
  }

  constructor(
    private modalController: ModalController,
    private pickerCtrl: PickerController,
    private busLineService: BusLineService,
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private ticketService: TicketService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    ) {
    this.minDate = new Date();
    this.dateAdapter.setLocale('cr');
  }

  ngOnInit() {
    this.busLineService.getBusLines().pipe(
      filter((data: IBusLine[]) => !!data),
      takeUntil(this.componentDestroyed$),
      map((data: IBusLine[]) => {
        return data.map((line: IBusLine) => {
          return {
            text: `(${line.lineCountryStart === 'bih' ? 'BIH' : 'DE'}) ${line.lineCityStart} - ${line.lineCityEnd}`,
            value: line,
          }
        })
      }),
      tap((data: PickerColumnOption[]) => {
        this.columnOptions = data;
        this.createTicketForm = this.fb.group({
          ticketOnName: this.fb.control('', Validators.required),
          ticketPhone: this.fb.control('', Validators.required),
          ticketEmail: this.fb.control('', Validators.required),
          ticketNote: this.fb.control(''),
          ticketValid: this.fb.control('6', Validators.required),
          ticketBusLineId: this.fb.control('', Validators.required),
          ticketRoundTrip: this.fb.control(false, Validators.required),
          ticketStartDate: this.fb.control('', Validators.required),
          ticketStartTime: this.fb.control('', Validators.required),
        });

        this.createTicketForm.valueChanges.pipe(
          filter((data: FormGroup) => !!data),
          tap((data: FormGroup) => {
            console.log(data);
          }),
          takeUntil(this.componentDestroyed$),
        ).subscribe();
      }),
    ).subscribe();
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  public getColumns(): PickerColumn[] {
    const options: PickerColumn = {
      name: 'linija',
      selectedIndex: 0,
      options: [...this.columnOptions],
    };
    return [options];
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
            this.handleBusLine(value);
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
    });

  }

  public selectDate(event: any): void {
    console.log(event.value);
    console.log(this.createTicketForm.controls['ticketStartDate']);

    console.log(event.value.getDay());
    console.log(this.daysForLine);
    this.createTicketForm.controls.ticketStartTime.setValue(this.daysForLine.find((item: any) => item.day == event.value.getDay()).time);
  }

  public handleBusLine(selectedLine: any): void {


    this.datepicker.disabled = true;
    this.datepicker.disabled = false;
    this.datepicker._getDateFilter();

    this.pickedOption = selectedLine;


    this.availableDays = selectedLine.linija.value.lineArray.map((line: any) =>  line.day);
    this.daysForLine = selectedLine.linija.value.lineArray;

    // reset datepicker to invalid days
    this.createTicketForm.controls['ticketBusLineId'].setValue(selectedLine.linija.value._id);
    this.createTicketForm.controls['ticketStartDate'].setValue('');
    this.createTicketForm.controls['ticketStartTime'].setValue('');
  }

  async handleButtonClick() {
    const loading = await this.loadingCtrl.create({
      message: 'Kreiranje Linije...',
      duration: 1000,
    });

    await loading.present();
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Karta uspjesno kreirana.',
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(msg: string) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: msg,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  public createTicket(): void {
    if(this.createTicketForm.valid) {
      this.presentLoading('Kreiranje karte...');
      this.ticketService.createTicket(this.createTicketForm.value).pipe(
        finalize(() => {
          this.loadingCtrl.dismiss();
          this.presentToast();
          this.dismissModal();
        }),
        takeUntil(this.componentDestroyed$),
      ).subscribe();
    }

  }

  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
