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

  request({ type, serviceName, actionName, data, responsesLimit }) {
    const isSingle = type === 'requestResponse';
    const isStream = type === 'requestStream' || type === 'requestChannel';
    const initialRespondsAmount = responsesLimit || 1;

    return Observable.create((subscriber) => {
      let unsubscribe;
      let socketSubscriber;
      const handleResponseBySubscriber = ({ data }) => {
        const methodName = !data.errorCode ? 'next' : 'error';
        subscriber[methodName](data);
      };
      this.socket[type]({ data, metadata: { q: `/${serviceName}/${actionName}` }})
        .subscribe({
          onNext: (response) => {
            if (!responsesLimit) {
              socketSubscriber && socketSubscriber.request(1);
            }
            handleResponseBySubscriber(response);
          },
          onComplete: (response) => {
            isSingle && handleResponseBySubscriber(response);
            subscriber.complete();
          },
          onError: (error) => subscriber.error(error),
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


