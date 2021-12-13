import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { saveAs } from 'file-saver';
import {DomSanitizer} from '@angular/platform-browser';
import {
  ActionSheetController, IonInfiniteScroll, LoadingController,
  MenuController,
  ModalController,
  PickerController,
} from '@ionic/angular';
import {from, Subject, throwError} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
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
import {tick} from "@angular/core/testing";

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.page.html',
  styleUrls: ['./tickets-list.page.scss'],
})
export class TicketsListPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('link') link: any;
  public componentDestroyed$: Subject<void> = new Subject<void>();
  public isMenuOpened = false;
  public searchLimit: number = 10;
  public ticketsCount: number = 10;
  public searchTermValue: string = '';
  public searchBarForm: FormGroup;

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
    private sanitizer:DomSanitizer,
    private loadingController: LoadingController,
    ) { }

  ngOnInit() {
    this.searchBarForm = this.fb.group({
      searchTerm: this.fb.control(''),
    });

    this.searchBarForm.get('searchTerm').valueChanges.pipe(
      debounceTime(1200),
      distinctUntilChanged(),
      tap((data: string) => data.length ? this.getTickets(data, 10): this.getTickets('', 10)),
      takeUntil(this.componentDestroyed$),
    ).subscribe();

    this.getTickets('', this.searchLimit);
  }

  public sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  public getTickets(searchTerm: string, searchLimit: number, event?: any): void {
    this.presentLoading('Učitavanje karti...')
    this.busLineService.getBusLines().pipe(
      filter((data: IBusLine[]) => !!data),
      tap((data: IBusLine[]) => {
        this.busLines = data;
        console.log(data);
      }),
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
        this.tickets = data;
        console.log(this.tickets);

        if(event) {
          event.target.complete();
        }
      }),
      finalize(() => {
        this.loadingController.dismiss();
      }),
      catchError((err: any) => {
        if(event) {
          event.target.complete();
        }

        this.loadingController.dismiss();

        return err;
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
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
        finalize(() => {
          if(this.ticketsCount > this.searchLimit) {
            this.infiniteScroll.disabled = true;
          }

          this.loadingController.dismiss();
        }),
      ).subscribe();
    } else {
      console.log('disabling infinite')
      this.infiniteScroll.disabled = true;
    }
  }

  public logout(): void {
    this.service.logout();
  }

  public getBusLineData(busLineId: string): IBusLine {
    return this.busLines.find((line: IBusLine) => line._id === busLineId);
  }

  public viewTyre(id: number): void {
    if(id) {
      this.router.navigate([`/gume/lista/${id}`]);
    }
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
      }, {
        text: 'Poništi',
        icon: 'trash-sharp',
        handler: () => {
          this.deleteTicket(ticket);
        }
      }, {
        text: 'Pošalji na email',
        icon: 'mail-sharp',
        handler: () => {
          this.emailTicket(ticket);
        }
      }, {
        text: 'Štampaj',
        icon: 'print',
        handler: () => {
          console.log(ticket);
          this.printTicket(ticket);
        }
      }, {
        text: 'Odustani',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  public emailTicket(ticket: ITicket): void {
    this.presentLoading('Karta se šalje na korisnikov email...')
    this.ticketService.emailTicket(ticket).pipe(
      filter((data: boolean) => !!data),
      finalize(() => {
        this.loadingController.dismiss();
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }


  async createTicket() {
    const modal = await this.modalController.create({
      component: CreateTicketComponent,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }


  async editTicket(ticket: ITicket) {
    const modal = await this.modalController.create({
      component: TicketEditComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        'ticketData': ticket,
      }
    });
    return await modal.present();
  }


  public getMenuOpened(): void {
    from(this.menu.isOpen()).pipe(
      tap((data: boolean) => {
        console.log(data);
        this.isMenuOpened = data;
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  menuOpen(menu: string) {
    this.isMenuOpened = true;
    this.menu.open(menu);
  }

  menuClose(menu: string) {
    this.isMenuOpened = false;
    this.menu.close(menu);
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  async presentLoading(msg: string) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: msg,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }


  public printTicket(ticket: ITicket): void {
    this.presentLoading('Štampanje karte u toku...');
    this.ticketService.printTicket(ticket).pipe(
      tap((response: ArrayBuffer) => {
        let file = new Blob([response], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL);
        saveAs(file, 'karta-express-trans.pdf');
      }),
      finalize(() => {
        this.loadingController.dismiss();
      }),
      catchError((error: Error) => {
        this.loadingController.dismiss();
        return throwError(error);
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public deleteTicket(ticket: ITicket): void {
    this.presentLoading(`Brisanje karte na ime "${ticket.ticketOnName}" u toku...`);
    this.ticketService.deleteTicket(ticket._id).pipe(
      filter((data: ITicket) => !!data),
      finalize(() => {
        this.loadingController.dismiss();
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
