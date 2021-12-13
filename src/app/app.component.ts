import { Component } from '@angular/core';
import { fadeAnimation } from '@app/animations';
import {UserServiceService} from '@app/services/user-service.service';
import {IUser} from '@app/services/user.interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [ fadeAnimation ] // register the animation
})
export class AppComponent {
  public logoUrl: string = 'assets/images/express-trans-logo.png';
  public user: IUser;

  constructor(private accountService: UserServiceService) {
    this.accountService.user.subscribe(x => this.user = x);
  }

  public logout(): void {
    this.accountService.logout();
  }
}
