import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';

export class RSocketProvider {
  constructor() {
    this.client = new RSocketClient({
      serializers: JsonSerializers,
      setup: {
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: 'application/json',
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({ url: 'ws://localhost:8080', wsCreator: url => new WebSocket(url) }),
    });
    this.cancelConnection = null;
    this.socket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.connect().subscribe({
        onComplete: (socket) => {
          this.socket = socket;
          resolve();
        },
        onError: reject,
        onSubscribe: cancel => { this.cancelConnection = cancel }
      });
    });
  }

  closeConnection() {
    return new Promise((resolve, reject) => {
      if (!this.cancelConnection) {
        return reject('The connection is not opened');
      }
      this.cancelConnection();
      resolve();
    });
  }

  request({ type, serviceName, actionName, data }) {
    const isSingle = type === 'requestResponse';
    const isStream = type === 'requestStream' || type === 'requestChannel';

    return Observable.create((subscriber) => {
      let cancelSubscription;
      this.socket[type]({ data, metadata: { q: `/${serviceName}/${actionName}` }})
        .subscribe({
          onNext: (response) => {
            subscriber.next(response.data);
          },
          onComplete: (response) => {
            isSingle && subscriber.next(response.data);
            subscriber.complete();
          },
          onError: subscriber.error,
          onSubscribe: (data) => {
            if (isStream) {
              cancelSubscription = data.cancel;
              data.request(7);
            }
            if (isSingle) {
              cancelSubscription = data;
            }
          }
        });

      return cancelSubscription;
    });
  }

}


