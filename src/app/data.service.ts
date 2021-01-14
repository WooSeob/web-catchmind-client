import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { Draw } from './draw';

import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RESOURCE_CACHE_PROVIDER } from '@angular/platform-browser-dynamic';
import { BROWSER_STORAGE } from './storage';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    // private http: HttpClient,
  ) {}

  private apiBaseUrl = 'https://loc8rv3.herokuapp.com/api';
  
  // public getNewRoomID(): Promise<string> {
  //   const url: string = `${this.apiBaseUrl}/new-room/`;
  //   return this.http
  //     .get(url)
  //     .toPromise()
  //     .then((response) => response as string)
  //     .catch(this.handlerError);
  // }

  // public getMatchedRoomID(): Promise<string> {
  //   const url: string = `${this.apiBaseUrl}/search-room/`;
  //   return this.http
  //     .get(url)
  //     .toPromise()
  //     .then((response) => response as string)
  //     .catch(this.handlerError);
  // }

  // private handlerError(error: any): Promise<any> {
  //   console.error('Something has gone wrong', error);
  //   return Promise.reject(error.message || error);
  // }
}
