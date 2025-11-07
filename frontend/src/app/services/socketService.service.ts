import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { enviroment } from '../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly serverURL = enviroment.serverURL;
  private socket!: Socket;
  // Act as a producer and consumer. Open channel where someone send a msg
  // on one end and any subscriber will receive it on other hand.
  public refresh = new Subject<void>();

  constructor(private zone: NgZone) {
    // 👇 Inicializa el socket una sola vez
    this.socket = io(this.serverURL, {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('refresh-locations', () => {
      // Tell angular that an event happened. that will execute the event and next
      // it will execute a "change detection" to refresh front view
      // With refresh.next it´s sending the message through the channel
      this.zone.run(() => this.refresh.next());
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
