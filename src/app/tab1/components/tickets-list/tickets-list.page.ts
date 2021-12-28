import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { saveAs } from 'file-saver';
import {
  ActionSheetController, IonInfiniteScroll, LoadingController,
  MenuController,
  ModalController,
  PickerController, Platform, ToastController,
} from '@ionic/angular';
import {Subject, throwError} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import {UserServiceService} from '@app/services/user-service.service';
import {Router} from '@angular/router';
import {CreateTicketComponent} from '@app/tab1/components/create-ticket/create-ticket.component';
import {TicketService} from "@app/tab1/ticket.service";
import {ITicket} from "@app/tab1/ticket.interface";
import {BusLineService} from "@app/tab2/bus-line.service";
import {IBusLine} from "@app/tab2/tab2.interface";
import {ICommonResponse} from "@app/services/user.interface";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TicketEditComponent} from "@app/tab1/components/ticket-edit/ticket-edit.component";
import {File} from "@ionic-native/file";
import {FileOpener} from "@ionic-native/file-opener";
import {CallNumber} from "@awesome-cordova-plugins/call-number/ngx";

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.page.html',
  styleUrls: ['./tickets-list.page.scss'],
})
export class TicketsListPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('link') link: any;
  public componentDestroyed$: Subject<void> = new Subject<void>();
  public searchLimit: number = 10;
  public ticketsCount: number = 10;
  public searchTermValue: string = '';
  public searchBarForm: FormGroup;
  public bihImage: string = 'assets/images/bih.png';
  public deImage: string = 'assets/images/germany.png';
  public tickets: ITicket[] = [];
  public busLines: IBusLine[] = [];
  public ticketToPrintLink: string;
  public linkUrl: string = '';

  constructor(
    private pickerCtrl: PickerController,
    private menu: MenuController,
    private service: UserServiceService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private ticketService: TicketService,
    private busLineService: BusLineService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private platform: Platform,
    private toastController: ToastController,
    private callNumber: CallNumber) {}

  ngOnInit() {
    this.searchBarForm = this.fb.group({
      searchTerm: this.fb.control(''),
    });

    this.searchBarForm.get('searchTerm').valueChanges.pipe(
      debounceTime(1200),
      distinctUntilChanged(),
      tap((data: string) => data.length ?
        this.getTickets(data, 10) :
        this.getTickets('', 10)),
      takeUntil(this.componentDestroyed$),
    ).subscribe();

    this.getTickets('', this.searchLimit);
  }

  public getTickets(searchTerm: string, searchLimit: number, event?: any): void {
    this.presentLoading('Učitavanje karti...').then(() => {
      this.busLineService.getBusLines().pipe(
        filter((data: IBusLine[]) => !!data),
        tap((data: IBusLine[]) => this.busLines = data),
        concatMap(() => this.ticketService.searchTickets({ searchTerm: searchTerm,searchLimit: searchLimit})),
        filter((data: ICommonResponse<ITicket[]>) => !!data),
        map((data: ICommonResponse<ITicket[]>) => {
          this.ticketsCount = data.count;
          this.searchLimit = searchLimit;
          this.searchTermValue = searchTerm;

          return data.data.map((ticket: ITicket) => {
            return {
              ...ticket,
              busLineData: this.getBusLineData(ticket.ticketBusLineId),
            }
          })
        }),
        tap((data: ITicket[]) => {
          this.tickets = [...data];

          if(event) { event.target.complete() }

          this.loadingController.dismiss();
        }),
        catchError((err: Error) => {
          if(event) { event.target.complete() }

          this.loadingController.dismiss();

          return throwError(err);
        }),
        takeUntil(this.componentDestroyed$),
      ).subscribe();
    });

  }

  public getMoreTickets(): void {
    this.presentLoading('Učitavanje karti...')
    if(this.ticketsCount > this.searchLimit) {
      this.searchLimit += 10;
      this.ticketService.searchTickets({searchTerm: this.searchTermValue, searchLimit: this.searchLimit}).pipe(
        filter((data:ICommonResponse<ITicket[]>) => !!data),
        take(1),
        map((data: ICommonResponse<ITicket[]>) => {
          this.ticketsCount = data.count;
          return data.data.map((ticket: ITicket) => {
            return {
              ...ticket,
              busLineData: this.getBusLineData(ticket.ticketBusLineId),
            }
          })
        }),
        tap((tickets: ITicket[]) => {
          this.tickets = [...this.tickets, ...tickets];
          this.ticketsCount = this.tickets.length;
        }),
        tap(() => {
          if(this.ticketsCount > this.searchLimit) {
            this.infiniteScroll.disabled = true;
          }

          this.loadingController.dismiss();
        }),
        catchError((error: Error) => {
          this.loadingController.dismiss();
          return throwError(error);
        }),
      ).subscribe();
    } else {
      this.infiniteScroll.disabled = true;
    }
  }

  public getBusLineData(busLineId: string): IBusLine {
    return this.busLines.find((line: IBusLine) => line._id === busLineId);
  }

  async presentActionSheet(ticket: ITicket) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Akcije',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Uredi',
        role: 'uredi',
        icon: 'create-sharp',
        handler: () => {
          this.editTicket(ticket);
        }
      },
      {
        text: 'Poništi',
        icon: 'trash-sharp',
        handler: () => {
          this.deleteTicket(ticket);
        }
      },
      {
        text: 'Pošalji na email',
        icon: 'mail-sharp',
        handler: () => {
          this.emailTicket(ticket);
        }
      },
      {
        text: 'Štampaj',
        icon: 'print',
        handler: () => {
          this.printTicket(ticket);
        }
      },
      {
          text: 'Pozovi',
          icon: 'call',
          handler: () => {
            this.callCustomer(ticket.ticketPhone);
          }
        },
        {
        text: 'Odustani',
        icon: 'close',
        role: 'cancel',
      }
    ]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  public callCustomer(phoneNum: string): void {
    if(this.platform.is('android') || this.platform.is('ios')) {
      this.callNumber.callNumber(phoneNum, true)
        .then(res => console.log('Launched dialer!', res))
        .catch(err => console.log('Error launching dialer', err));
    } else {
      this.presentToast('Ova opcija je dozvoljena za mobilne uređaje');
    }

  }

  public emailTicket(ticket: ITicket): void {
    this.presentLoading('Karta se šalje na korisnikov email...');
    this.ticketService.emailTicket(ticket).pipe(
      filter((data: boolean) => !!data),
      tap(() => this.loadingController.dismiss()),
      catchError((error: Error) => {
        this.loadingController.dismiss();
        return throwError(error);
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  async createTicket() {
    const modal = await this.modalController.create({component: CreateTicketComponent});
    modal.onDidDismiss().then((data: any) => {
      const newTicket: ITicket = { ...data.data,  busLineData: this.getBusLineData(data.data.ticketBusLineId)};
      this.tickets.unshift(newTicket);
    });

    return await modal.present();
  }

  async editTicket(ticket: ITicket) {
    const modal = await this.modalController.create({
      component: TicketEditComponent,
      componentProps: {
        'ticketData': ticket,
      }
    });
    return await modal.present();
  }

  async presentLoading(msg: string) {
    const loading = await this.loadingController.create({ message: msg, duration:2000 });
    await loading.present();
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: 'primary',
    });
    await toast.present();
  }

  public printTicket(ticket: ITicket): void {
    this.presentLoading('Štampanje karte u toku...');
    this.ticketService.printTicket(ticket).pipe(
      take(1),
      tap((response: ArrayBuffer) => {
        if (this.platform.is('android') || this.platform.is('ios')) {

          try {
            File.writeFile(
              File.externalRootDirectory + "/Download",
              `${ticket.ticketOnName}_express_trans.pdf`,
              new Blob([response], { type: 'application/pdf' }),
              {
                replace: true,
              }
            )
              .then(() => {
                console.log("Saved external root directory");
              })
              .catch((error) => {
                return throwError(error);
              });
          } catch (err) {
            throwError(err);
          }

          this.presentToast('Štampanje završeno.');

        } else {
          let file = new Blob([response], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          saveAs(file, 'karta-express-trans.pdf');
        }
      }),
      tap(() => {
        FileOpener.open(
          File.externalRootDirectory + "/Downloads/" + 'karta-express-trans.pdf',
          "application/pdf"
        );
        this.loadingController.dismiss();
      }),
      catchError((error: Error) => {
        this.loadingController.dismiss();
        return throwError(error);
      }),
    ).subscribe();
  }

  public deleteTicket(ticket: ITicket): void {
    this.presentLoading(`Brisanje karte na ime "${ticket.ticketOnName}" u toku...`);

    this.ticketService.deleteTicket(ticket._id).pipe(
      filter((data: ICommonResponse<any>) => !!data),
      tap(() => {
        this.tickets = [...this.tickets.filter((ticketToDelete: ITicket) => ticketToDelete._id !== ticket._id)];
        this.loadingController.dismiss()
      }),
      catchError((error: Error) => {
        this.loadingController.dismiss();
        return throwError(error);
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
