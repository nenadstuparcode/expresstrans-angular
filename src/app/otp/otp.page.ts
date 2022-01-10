import { Component, OnInit } from '@angular/core';
import {UserServiceService} from "@app/services/user-service.service";
import {Subject, throwError} from "rxjs";
import {takeUntil, filter, tap, finalize, catchError} from "rxjs/operators";
import {IResponse} from "@app/services/user.interface";
import {ToastController} from "@ionic/angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {

  public otpForm: FormGroup;
  public componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private service: UserServiceService,
              private toastController: ToastController,
              private fb: FormBuilder,
              private router: Router) { }

  ngOnInit() {
    this.otpForm = this.fb.group({
      email: this.fb.control('', Validators.required),
      code: this.fb.control('', Validators.required),
    });
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: 'primary',
    });
    await toast.present();
  }

  public sendVerificationCode(): void {
    this.service.submitVerificationCode(this.otpForm.controls.email.value, this.otpForm.controls.code.value).pipe(
      filter((data: IResponse) => !!data),
      tap((data: IResponse) => {
       data.status === 1 ?
          this.presentToast('Kod je validan.') :
          this.presentToast('Kod nije validan');
      }),
      finalize(() => {
        this.router.navigate(['/login'])
      }),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public resendVerificationCode(): void {
    this.service.resendVerificationCode(this.otpForm.controls.email.value).pipe(
      takeUntil(this.componentDestroyed$),
      filter((data: IResponse) => !!data),
      tap((data: IResponse) => {
        data.status === 1 ?
          this.presentToast('Kod je poslan na email adresu.') :
          this.presentToast('Ponovno slanje koda nije uspjelo');
      }),
      catchError((err: any) => {
        this.presentToast(err);

        return throwError(err);
      }),
    ).subscribe();
  }

}
