import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public sendVerificationCode(): void {
    //TODO SEND VERIFICATION CODE
  }

  public resendVerificationCode(): void {
    //TODO RESEND VERIFICATION CODE
  }

}
