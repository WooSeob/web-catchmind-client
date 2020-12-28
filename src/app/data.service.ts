import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { Draw } from './draw';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private socket: Socket) {}

  sendMessage(data: Draw) {
    console.log('send msg');
    this.socket.emit('draw cmd', data);
  }
  getMessage() {
    return this.socket.fromEvent('draw cmd').pipe(map((data) => data));
  }
}
