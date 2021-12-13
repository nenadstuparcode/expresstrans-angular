import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceService} from '@app/services/user-service.service';
import {IUser, IUserRegister} from '@app/services/user.interface';
import {filter, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
  public componentDestroyed$: Subject<void> = new Subject<void>();
  public showPassword1 = false;
  public showPassword2 = false;
  public registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: UserServiceService,
    ) { }

  ngOnInit() {
    this.registrationForm = this.fb.group({
      firstName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      lastName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
    }, { validator: this.checkPasswords });
  }

  public register(): void {
    const userData: IUserRegister = {
      firstName: this.registrationForm.controls.firstName.value,
      lastName: this.registrationForm.controls.lastName.value,
      email: this.registrationForm.controls.email.value,
      password: this.registrationForm.controls.password.value,
    };

    this.service.register(userData).pipe(
      filter((data: IUser) => !!data),
      takeUntil(this.componentDestroyed$),
    ).subscribe();
  }

  public checkPasswords(group: FormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true };
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
