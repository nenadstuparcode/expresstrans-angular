import { Component, OnInit } from '@angular/core';
import {UserServiceService} from "@app/services/user-service.service";
import {IUser} from "@app/services/user.interface";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {

  public user: IUser;
  constructor(private userService: UserServiceService) { }

  ngOnInit() {
    this.user = this.userService.getUser();
  }

}
