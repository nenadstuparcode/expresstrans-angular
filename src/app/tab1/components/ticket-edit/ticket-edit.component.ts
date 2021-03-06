import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDatepicker} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subject} from "rxjs";
import {
  LoadingController,
  ModalController, PickerColumn,
  PickerColumnOption,
  PickerController,
  ToastController
} from "@ionic/angular";
import {BusLineService} from "@app/tab2/bus-line.service";
import {DateAdapter} from "@angular/material/core";
import {TicketService} from "@app/tab1/ticket.service";
import {filter, finalize, map, takeUntil, tap} from "rxjs/operators";
import {IBusLine} from "@app/tab2/tab2.interface";
import {ITicket} from "@app/tab1/ticket.interface";

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.scss'],
})
export class TicketEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @Input() ticketData: ITicket = null;
  public editTicketForm: FormGroup;

  public componentDestroyed$: Subject<void> = new Subject<void>();
  public email: string = '';
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

  public ngAfterViewInit():void {
    this.busLineService.getBusLines().pipe(
      tap((data: IBusLine[]) => {
        const selectedLine: IBusLine[] = data.filter((line: IBusLine) => {
          return line._id === this.ticketData.ticketBusLineId;
        });

        this.pickedOption = {
          linija: {
            text: `(${selectedLine[0].lineCountryStart === 'bih' ? 'BIH' : 'DE'}) ${selectedLine[0].lineCityStart} - ${selectedLine[0].lineCityEnd}`,
            value: selectedLine[0],
          }
        };
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
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
        });
      }),
      tap((data: PickerColumnOption[]) => {
        this.columnOptions = data;
        this.editTicketForm = this.fb.group({
          ticketOnName: this.fb.control(this.ticketData.ticketOnName, Validators.required),
          ticketPhone: this.fb.control(this.ticketData.ticketPhone, Validators.required),
          ticketEmail: this.fb.control(this.ticketData.ticketEmail, Validators.required),
          ticketNote: this.fb.control(this.ticketData.ticketNote),
          ticketValid: this.fb.control(this.ticketData.ticketValid, Validators.required),
          ticketBusLineId: this.fb.control(this.ticketData.ticketBusLineId, Validators.required),
          ticketRoundTrip: this.fb.control(this.ticketData.ticketRoundTrip, Validators.required),
          ticketStartDate: this.fb.control(this.ticketData.ticketStartDate, Validators.required),
          ticketStartTime: this.fb.control(this.ticketData.ticketStartTime, Validators.required),
        });

        this.editTicketForm.valueChanges.pipe(
          filter((data: FormGroup) => !!data),
          takeUntil(this.componentDestroyed$),
        ).subscribe();
      }),
    ).subscribe();
  }

  dismissModal(role: string) {
    this.modalController.dismiss({
      dismissed: true
    }, role);
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
    this.editTicketForm.controls.ticketStartTime.setValue(this.daysForLine.find((item: any) => item.day == event.value.getDay()).time);
  }

  public handleBusLine(selectedLine: any): void {

    this.datepicker.disabled = true;
    this.datepicker.disabled = false;
    this.datepicker._getDateFilter();

    this.pickedOption = selectedLine;

    // reset datepicker to invalid days
    this.availableDays = selectedLine.linija.value.lineArray.map((line: any) =>  line.day);
    this.daysForLine = selectedLine.linija.value.lineArray;

    // reset datepicker to invalid days
    this.editTicketForm.controls['ticketBusLineId'].setValue(selectedLine.linija.value._id);
    this.editTicketForm.controls['ticketStartDate'].setValue('');
    this.editTicketForm.controls['ticketStartTime'].setValue('');
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
      message: 'Karta uspjesno a??urirana.',
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
  }

  public updateTicket(): void {
    if(this.editTicketForm.valid) {
      this.presentLoading('A??uriranje karte...');
      this.ticketService.updateTicket(this.editTicketForm.value, this.ticketData._id).pipe(
        finalize(() => {
          this.loadingCtrl.dismiss();
          this.presentToast();
          this.dismissModal('dismiss');
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
