import { Injectable } from '@angular/core';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {ICommonResponse, IUser, IUserLoginResponse, IUserRegister} from '@app/services/user.interface';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {filter, finalize, map, tap} from 'rxjs/operators';
import {environment} from "@env/environment";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private userSubject: BehaviorSubject<IUser>;
  public user: Observable<IUser>;
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    this.userSubject = new BehaviorSubject<IUser>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
    if(!!JSON.parse(localStorage.getItem('user'))) {
      this.isLoggedIn$.next(true);
    }
  }

  public getUser(): IUser {
    return this.userSubject.value;
  }

  public login(email: string, password: string): Observable<IUser> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { email, password}).pipe(
      filter((data: ICommonResponse<IUser>) => !!data),
      map((data: ICommonResponse<IUser>) => {
        this.userSubject.next(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      }),
      finalize(() => {
        this.isLoggedIn$.next(true);
        this.router.navigate(['/'])
      })
    );
  }

  public logout(): void {
    this.isLoggedIn$.next(false);
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.user = EMPTY;
    this.router.navigate(['/login']);
  }

  public register(user: IUserRegister): Observable<IUser> {
    return this.http.post(`${environment.apiUrl}/auth/register`,
      { firstName: user.firstName, lastName: user.lastName, password: user.password, email: user.email}).pipe(
        filter((data: ICommonResponse<IUser>) => !!data && data.status === 0),
        map((data: ICommonResponse<IUser>) => data.data),
        finalize(() => {
          this.router.navigate(['/otp']);
        })
    );
  }

  public submitVerificationCode(email: string, otp: number): Observable<IUserLoginResponse> {
    return this.http.post(`${environment.apiUrl}/auth/verify-opt`, {email, otp}).pipe(
      filter((data: IUserLoginResponse) => !!data && data.status === 0),
      map((data: IUserLoginResponse) => data),
      finalize(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  public resendVerificationCode(email: string): Observable<IUserLoginResponse> {
    return this.http.post(`${environment.apiUrl}/auth/resend-verify-otp`, {email}).pipe(
      filter((data: IUserLoginResponse) => !!data && data.status === 0),
      map((data: IUserLoginResponse) => data),
      finalize(() => {
        this.router.navigate(['/opt']);
      })
    );
  }

}
