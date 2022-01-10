import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserServiceService} from '@app/services/user-service.service';
import {Subject, throwError} from 'rxjs';
import {catchError, filter, takeUntil, tap} from 'rxjs/operators';
import {ICommonResponse, IUser} from '@app/services/user.interface';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  public componentDestroyed$: Subject<void> = new Subject<void>();
  public showPassword1 = false;
  public loginForm: FormGroup;

  constructor(
    private userService: UserServiceService,
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    ) { }

  public ngOnInit(): void {
     this.loginForm = this.fb.group({
       email: this.fb.control('', [Validators.required, Validators.email]),
       password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
     });
  }

  public login(): void {
    this.userService.login(this.loginForm.get('email').value, this.loginForm.get('password').value).pipe(
      filter((data: ICommonResponse<IUser>) => !!data && this.loginForm.valid),
      takeUntil(this.componentDestroyed$),
      tap(() => this.router.navigate(['/karte'])),
      catchError((err: any) => {
        this.presentToast(err);

        return throwError(err);
      }),
    ).subscribe();
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }

  public toggleShowPassword1(): void {
    this.showPassword1 = !this.showPassword1;
  }

  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
