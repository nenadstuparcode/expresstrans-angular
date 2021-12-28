import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserServiceService} from '@app/services/user-service.service';
import {Subject} from 'rxjs';
import {filter, takeUntil, tap} from 'rxjs/operators';
import {IUser} from '@app/services/user.interface';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  public componentDestroyed$: Subject<void> = new Subject<void>();
  public showPassword1 = false;
  public showPassword2 = false;
  public loginForm: FormGroup;

  constructor(
    private userService: UserServiceService,
    private fb: FormBuilder,
    private router: Router,
    ) { }

  ngOnInit() {
     this.loginForm = this.fb.group({
       email: this.fb.control('', [Validators.required, Validators.email]),
       password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
     });
  }

  public login(): void {
    this.userService.login(this.loginForm.get('email').value, this.loginForm.get('password').value).pipe(
      filter((data: IUser) => !!data && this.loginForm.valid),
      takeUntil(this.componentDestroyed$),
      tap(() => this.router.navigate(['/karte']))
    ).subscribe();
  }

  public toggleShowPassword1(): void {
    this.showPassword1 = !this.showPassword1;
  }

  public toggleShowPassword2(): void {
    this.showPassword2 = !this.showPassword2;
  }

  public ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
