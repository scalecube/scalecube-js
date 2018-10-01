// @flow
import RSocketWebSocketClient from 'rsocket-websocket-client';
import WS from 'isomorphic-ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable } from 'rxjs';
import {
  validateRequest, extractConnectionError, validateBuildConfig, getTextResponseMany,
  getFailingOneResponse, getFailingManyResponse, getTextResponseSingle
} from '../utils';
import { TransportServerProvider } from '../api/TransportServerProvider';
import { TransportProviderConfig, TransportRequest } from '../api/types';
import { errors } from '../errors';

import { RSocketServer } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Single, Flowable } from 'rsocket-flowable';

export class RSocketServerProvider implements TransportServerProvider {
  _server: any;
  _listeners: any;

  constructor() {
    this._server = null;
    this._listeners = {};
    return this;
  }

  build(config: TransportProviderConfig): Promise<void> {
    const self = this;
    this._server = new RSocketServer({
      getRequestHandler: (socket) => {
        return {
          requestResponse({ data, metadata: { q: entrypoint } }) {
            return new Single(subscriber => {
              subscriber.onSubscribe();
              if (Object.keys(self._listeners).includes(entrypoint)) {
                const request = { data, entrypoint, headers: { type: 'requestResponse' } };
                self._listeners[entrypoint](request).subscribe(response => subscriber.onComplete({ data: response }));
              }
            });
          },
          requestStream({ data, metadata: { q: entrypoint, responsesLimit } }) {
            console.log('responsesLimit from request', responsesLimit);
            return new Flowable(subscriber => {
              let index = 0;
              let isStreamCanceled = false;
              subscriber.onSubscribe({
                cancel: () => { isStreamCanceled = true },
                request: n => {

                  console.log('responsesLimit n', n);

                  if (Object.keys(self._listeners).includes(entrypoint)) {
                    const request = { data, entrypoint, headers: { type: 'requestStream', responsesLimit: n } };
                    const subscription = self._listeners[entrypoint](request).subscribe(
                      response => {
                        index++;
                        subscriber.onNext({ data: response });
                        if (index === n) {
                          console.log('index === n subscription', subscription);
                          subscription.unsubscribe();
                          subscriber.onComplete();
                        }
                      },
                      error => subscriber.onError(error),
                      () => subscriber.onComplete()
                    );
                  }
                }
              });
            });
          }
        };
      },
      serializers: JsonSerializers,
      transport: new RSocketWebSocketServer({
        protocol: 'ws',
        host: '0.0.0.0',
        port: 8080
      })
    });
    this._server.start();
    return Promise.resolve();
  }

  listen(path, callback) {
    this._listeners[path] = callback;
    return this;
  }

  destroy(): Promise<void> {
    return new Promise((resolve) => {
      this._server.stop();
      resolve();
    });
  }

}
