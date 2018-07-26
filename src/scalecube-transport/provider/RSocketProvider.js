import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';

export class RSocketProvider {
  constructor({ url, keepAlive = 60000, lifetime = 180000, wsCreator = url => new WebSocket(url) }) {
    this.client = new RSocketClient({
      serializers: JsonSerializers,
      setup: {
        keepAlive,
        lifetime,
        dataMimeType: 'application/json',
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({ url, wsCreator }),
    });
    this.disconnect = null;
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
        onSubscribe: disconnect => { this.disconnect = disconnect }
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this.disconnect) {
        return reject('The connection is not opened');
      }
      this.disconnect();
      resolve();
    });
  }

  request({ type, serviceName, actionName, data, respondsLimit }) {
    const isSingle = type === 'requestResponse';
    const isStream = type === 'requestStream' || type === 'requestChannel';
    const initialRespondsAmount = respondsLimit || 1;

    return Observable.create((subscriber) => {
      let unsubscribe;
      let socketSubscriber;
      this.socket[type]({ data, metadata: { q: `/${serviceName}/${actionName}` }})
        .subscribe({
          onNext: (response) => {
            if (!respondsLimit) {
              socketSubscriber && socketSubscriber.request(1);
            }
            subscriber.next(response.data);
          },
          onComplete: (response) => {
            isSingle && subscriber.next(response.data);
            subscriber.complete();
          },
          onError: subscriber.error,
          onSubscribe: (socketSubscriberData) => {
            if (isStream) {
              unsubscribe = socketSubscriberData.cancel;
              socketSubscriber = socketSubscriberData;
              socketSubscriberData.request(initialRespondsAmount);
            }
            if (isSingle) {
              unsubscribe = socketSubscriberData;
            }
          }
        });

      return unsubscribe;
    });
  }

}


