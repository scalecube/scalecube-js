import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';
import {JsonSerializers, RSocketClient} from "rsocket-core";

export class RSocketProvider {
  constructor() {
    this.client;
  }

  buildClient() {
    this.client = new RSocketClient({
      // send/receive objects instead of strings/buffers
      serializers: JsonSerializers,
      setup: {
        // ms btw sending keepalive to server
        keepAlive: 60000,
        // ms timeout if no keepalive response
        lifetime: 180000,
        // format of `data`
        dataMimeType: 'application/json',
        // format of `metadata`
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({url: 'ws://localhost:8080', wsCreator: url => new WebSocket(url)}),
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject('No client has been built.');
      }
      let cancel;

      this.client.connect().subscribe({
        onComplete: (socket) => resolve({ socket, cancel }),
        onError: reject,
        onSubscribe: cancelFn => { cancel = cancelFn }
      });
    });
  }
}


