import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ICommonResponse} from '@app/services/user.interface';
import {catchError, filter, pluck, tap} from 'rxjs/operators';
import {IBusLine, ICreateBusLinePayload, ICreateBusLineResponse} from '@app/tab2/tab2.interface';
import { environment } from "@env/environment";

@Injectable({
  providedIn: 'root',
})
export class BusLineService {
  constructor(
    private router: Router,
    private http: HttpClient,
  ) { }

  public createBusLine(payload: ICreateBusLinePayload): Observable<ICommonResponse<ICreateBusLineResponse>> {
    return this.http.post(`${environment.apiUrl}/busLine`, payload).pipe(
      filter((data: ICommonResponse<ICreateBusLineResponse>) => !!data),
      tap((data: ICommonResponse<ICreateBusLineResponse>) => console.log(data.data)),
    );
  }

  public getBusLines(): Observable<IBusLine[]> {
    return this.http.get(`${environment.apiUrl}/busLine`).pipe(
      filter((data: ICommonResponse<IBusLine[]>) => !!data),
      pluck('data'),
      catchError((error: Error) => {
        return throwError(error);
      }),
    );
  }

  public getBusLine(id: string): Observable<ICommonResponse<IBusLine>> {
    return this.http.get(`${environment.apiUrl}/busLine/${id}`).pipe(
      filter((data: ICommonResponse<IBusLine>) => !!data),
    );
  }

  public updateBusLine(payload: ICreateBusLinePayload, id: string): Observable<ICommonResponse<IBusLine>> {
    return this.http.put(`${environment.apiUrl}/busLine/${id}`, payload).pipe(
      filter((data: ICommonResponse<IBusLine>) => !!data),
    );
  }

  public deleteBusLine(id: string): Observable<IBusLine> {
    return this.http.delete(`${environment.apiUrl}/busLine/${id}`).pipe(
      filter((data: ICommonResponse<IBusLine>) => !!data),
      pluck('data'),
    );
  }

  public searchBusLines(payload : {searchTerm: string, searchLimit: number}): Observable<ICommonResponse<IBusLine[]>> {
    return this.http.post(`${environment.apiUrl}/busLine/search`, payload ).pipe(
      filter((data: ICommonResponse<IBusLine[]>) => !!data),
      tap((data: ICommonResponse<IBusLine[]>) => console.log(data.data)),
    )
  }

}
