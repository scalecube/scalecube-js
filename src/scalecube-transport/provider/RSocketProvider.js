// @flow
import RSocketWebSocketClient from 'rsocket-websocket-client';
import WS from 'isomorphic-ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';
import { validateRequest, extractConnectionError, validateBuildConfig } from '../utils';
import { ProviderInterface } from '../api/ProviderInterface';
import { ProviderConfig, TransportRequest } from '../api/types';

export class RSocketProvider implements ProviderInterface {
  _client: any;
  _socket: any;

  constructor() {
    this._client = null;
    this._socket = null;
  }

  build(config: ProviderConfig): Promise<void> {
    let { URI, keepAlive = 60000, lifetime = 180000, WebSocket = WS } = config;
    const wsCreator = URI => new WebSocket(URI);
    return new Promise((resolve, reject) => {
      const validationError = validateBuildConfig({ URI, keepAlive, lifetime, WebSocket });
      if (validationError) {
        return reject(new Error(validationError))
      }

      try {
        this._client = new RSocketClient({
          serializers: JsonSerializers,
          setup: {
            keepAlive,
            lifetime,
            dataMimeType: 'application/json',
            metadataMimeType: 'application/json'
          },
          transport: new RSocketWebSocketClient({ url: URI, wsCreator }),
        });
      } catch(error) {
        return reject(error);
      }

      this._connect()
        .then(resolve)
        .catch(error => reject(extractConnectionError(error)))
    });
  }

  request(requestData: TransportRequest): Observable<any> {
    const { headers: { type, responsesLimit }, data, entrypoint } = requestData;
    const isSingle = type === 'requestResponse';
    const isStream = type === 'requestStream' || type === 'requestChannel';
    const initialRespondsAmount = responsesLimit || 1;

    return Observable.create((subscriber) => {
      let unsubscribe;
      const validationError = validateRequest(requestData);
      if (validationError) {
        subscriber.error(new Error(validationError));
      } else {
        let socketSubscriber;
        let updates = 0;
        this._socket[type]({ data, metadata: { q: entrypoint }})
          .subscribe({
            onNext: (response) => {
              subscriber.next(response.data);
              updates++;
              if (responsesLimit && responsesLimit === updates) {
                unsubscribe();
              }
              !responsesLimit && socketSubscriber && socketSubscriber.request(1);
            },
            onComplete: (response) => {
              isSingle && subscriber.next(response.data);
              subscriber.complete();
            },
            onError: error => subscriber.error(error),
            onSubscribe: (socketSubscriberData) => {
              if (isStream) {
                unsubscribe = () => {
                  socketSubscriberData.cancel();
                  subscriber.complete();
                };
                socketSubscriber = socketSubscriberData;
                socketSubscriberData.request(initialRespondsAmount);
              }
              if (isSingle) {
                unsubscribe = socketSubscriberData;
              }
            }
          });
      }

      return unsubscribe;
    });
  }

  _connect(): Promise<void> {
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

  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._socket = null;
      this._client.close();
      resolve();
    });
  }

}


