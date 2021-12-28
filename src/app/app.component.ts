import {Component, OnDestroy, OnInit} from '@angular/core';
import { fadeAnimation } from '@app/animations';
import {UserServiceService} from '@app/services/user-service.service';
import {IUser} from '@app/services/user.interface';
import {BehaviorSubject, Observable, of, Subject} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [ fadeAnimation ] // register the animation
})
export class AppComponent implements OnInit, OnDestroy {
  public logoUrl: string = 'assets/images/express-trans-logo.png';
  public user: IUser;
  public isLoggedIn$: Observable<boolean>;
  public componentDestroyed$: Subject<void> = new Subject();

  constructor(private accountService: UserServiceService) {}

  public ngOnInit() {
    this.isLoggedIn$ = this.accountService.isLoggedIn$;
  }

  public ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  public logout(): void {
    this.accountService.logout();
  }
}
