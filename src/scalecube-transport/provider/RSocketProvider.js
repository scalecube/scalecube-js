import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';
import { validateRequest } from '../utils';

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
    this.socket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.connect().subscribe({
        onComplete: (socket) => {
          this.socket = socket;
          resolve();
        },
        onError: reject
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject('The connection is not opened');
      }
      this.socket = null;
      this.client.close();
      resolve();
    });
  }

  request(requestData) {
    const { type, serviceName, actionName, data, responsesLimit } = requestData;
    const isSingle = type === 'requestResponse';
    const isStream = type === 'requestStream' || type === 'requestChannel';
    const initialRespondsAmount = responsesLimit || 1;

    return Observable.create((subscriber) => {
      const validationError = validateRequest(requestData);
      if (validationError) {
        return subscriber.error(new Error(validationError));
      }

      let unsubscribe;
      let socketSubscriber;
      this.socket[type]({ data, metadata: { q: `/${serviceName}/${actionName}` }})
        .subscribe({
          onNext: (response) => {
            console.log('onNext response', response.data);
            subscriber.next(response.data);
            !responsesLimit && socketSubscriber && socketSubscriber.request(1);
          },
          onComplete: (response) => {
            console.log('onComplete response', response);
            isSingle && subscriber.next(response.data);
            subscriber.complete();
          },
          onError: error => subscriber.error(error),
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


