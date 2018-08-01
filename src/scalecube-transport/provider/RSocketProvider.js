import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'isomorphic-ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';
import { validateRequest } from '../utils';

export class RSocketProvider {

  constructor() {
    this._client = null;
    this._socket = null;
  }

  build({ url, keepAlive = 60000, lifetime = 180000, wsCreator = url => new WebSocket(url) }) {
    return new Promise((resolve, reject) => {
      this._client = new RSocketClient({
        serializers: JsonSerializers,
        setup: {
          keepAlive,
          lifetime,
          dataMimeType: 'application/json',
          metadataMimeType: 'application/json',
        },
        transport: new RSocketWebSocketClient({ url, wsCreator }),
      });
      this._connect()
        .then(resolve)
        .catch(reject)
    });
  }

  _connect() {
    return new Promise((resolve, reject) => {
      this._client.connect().subscribe({
        onComplete: (socket) => {
          this._socket = socket;
          resolve();
        },
        onError: reject
      });
    });
  }

  _disconnect() {
    return new Promise((resolve, reject) => {
      if (!this._socket) {
        return reject('The connection is not opened');
      }
      this._socket = null;
      this._client.close();
      resolve();
    });
  }

  request(requestData) {
    const { headers: { type, responsesLimit }, data, entrypoint } = requestData;
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
      this._socket[type]({ data, metadata: { q: entrypoint }})
        .subscribe({
          onNext: (response) => {
            subscriber.next(response.data);
            !responsesLimit && socketSubscriber && socketSubscriber.request(1);
          },
          onComplete: (response) => {
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


