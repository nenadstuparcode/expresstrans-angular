import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  ActionSheetController,
  AlertController, IonInfiniteScroll,
  LoadingController, ModalController,
  PickerColumnOption,
  ToastController
} from '@ionic/angular';
import {Router} from '@angular/router';
import {IBusLine} from '@app/tab2/tab2.interface';
import {BusLineService} from '@app/tab2/bus-line.service';
import {catchError, debounceTime, distinctUntilChanged, filter, finalize, take, takeUntil, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ICommonResponse} from "@app/services/user.interface";
import {BusLineEditComponent} from "@app/tab2/components/bus-line-edit/bus-line-edit.component";
import {BusLineCreateComponent} from "@app/tab2/components/bus-line-create/bus-line-create.component";

@Component({
  selector: 'app-bus-lines',
  templateUrl: './bus-lines.component.html',
  styleUrls: ['./bus-lines.component.scss'],
})
export class BusLinesComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public searchBarForm: FormGroup;

  public searchLimit: number = 10;
  public busLinesCount: number = 10;

  public searchTermValue: string = '';
  public bihImage: string = 'assets/images/bih.png';
  public deImage: string = 'assets/images/germany.png';
  private componentDestroyed$: Subject<void> = new Subject<void>();
  public tech: any = {
    title: 'linije',
    icon: 'bus-sharp',
    description: 'A powerful Javascript framework for building single page apps. Angular is open source, and maintained by Google.',
    color: '#E63135'
  };
  public busLines: IBusLine[] = [];
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
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private router: Router,
    private busLineService: BusLineService,
    public toastController: ToastController,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.searchBarForm = this.fb.group({
      searchTerm: this.fb.control(''),
    });

    this.searchBarForm.get('searchTerm').valueChanges.pipe(
      debounceTime(1200),
      distinctUntilChanged(),
      tap((data: string) => data.length ? this.getBusLines(data, 10): this.getBusLines('', 10)),
      takeUntil(this.componentDestroyed$),
    ).subscribe();

    this.getBusLines('', this.searchLimit);
  }

  public getMoreBusLines(): void {
    if(this.busLinesCount > this.searchLimit) {
        this.searchLimit += 10;
        this.busLineService.searchBusLines({searchTerm: this.searchTermValue, searchLimit: this.searchLimit}).pipe(
          filter((data:ICommonResponse<IBusLine[]>) => !!data),
          take(1),
          tap((data: ICommonResponse<IBusLine[]>) => {
            this.busLines = [...this.busLines, ...data.data];
            this.busLinesCount = this.busLines.length;
          }),
          finalize(() => {
            if(this.busLinesCount > this.searchLimit) {
              this.infiniteScroll.disabled = true;
            }
          }),
        ).subscribe();
    } else {
      this.infiniteScroll.disabled = true;
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Učitavanje...',
      duration: 3000
    });
    await loading.present();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Linija je obrisana.',
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }

  public deleteBusLine(id: string): void {
    this.busLineService.deleteBusLine(id).pipe(
      take(1),
      finalize(() => {
        this.presentToast();
        this.busLines = [...this.busLines.filter((busLine: IBusLine) => busLine._id !== id)];
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public getBusLines(searchTerm: string, searchLimit: number, event?: any): void {
    this.busLineService.searchBusLines({searchTerm: searchTerm, searchLimit: searchLimit}).pipe(
      filter((data: ICommonResponse<IBusLine[]>) => !!data),
      tap((data: ICommonResponse<IBusLine[]>) => {
        this.busLines = data.data;
        this.busLinesCount = data.count;
        this.searchLimit = searchLimit;
        this.searchTermValue = searchTerm;
        if(event) {
          event.target.complete();
        }
      }),
      catchError((err: any) => {
        if(event) {
          event.target.complete();
        }

        return err;
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  async deleteBusLineModal(id: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Obriši Liniju?',
      message: 'Da li ste sigurni da želite da obrišete liniju?',
      buttons: [
        {
          text: 'Otkaži',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Obriši',
          handler: () => {
            this.deleteBusLine(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentActionSheet(id: string) {

    const actionSheet = await this.actionSheetController.create({
      header: 'Akcije',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Uredi',
        role: 'uredi',
        icon: 'create-sharp',
        handler: () => {
          this.openEditBuslinetModal(this.busLines.find((line: IBusLine) => line._id === id));
        }
      },
      {
        text: 'Obriši',
        icon: 'trash-sharp',
        handler: () => {
          this.deleteBusLineModal(id);
        }
      },
      {
        text: 'Odustani',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  public async openCreateBuslineModal() {
    const modal = await this.modalCtrl.create(
      { component: BusLineCreateComponent },
    );

    modal.onDidDismiss().then((data: any) => {
      if(data.role === 'save') {
        const newBusline: IBusLine = data.data;
        this.busLines.unshift(newBusline);
      }
    });

    return await modal.present();
  }

  public async openEditBuslinetModal(data: IBusLine) {
    const modal = await this.modalCtrl.create(
      {
        component: BusLineEditComponent,
        componentProps: {
          'busLine': data,
        },
      }
    );

    modal.onDidDismiss().then((data: any) => {
      if(data.role === 'save') {
        const newBusline: IBusLine = data.data;
        this.busLines.unshift(newBusline);
      }
    });

    return await modal.present();
  }

  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
