// @flow
import { RSocketServer } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Single, Flowable } from 'rsocket-flowable';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable, ReplaySubject } from 'rxjs';
import 'rxjs/add/operator/elementAt';
import { TransportServerProvider } from '../api/TransportServerProvider';
import { TransportProviderConfig, TransportRequest } from '../api/types';
import { errors } from '../errors';
import { utils } from '@scalecube/scalecube-services';

export class RSocketServerProvider implements TransportServerProvider {
  _server: any;
  _listeners: any;

  constructor() {
    this._server = null;
    this._listeners = {};
    return this;
  }

  build(config: TransportProviderConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const serverConfig = {
        host: '0.0.0.0',
        port: 8080,
        ...(config || {})
      };
      const self = this;
      try {
        this._server = new RSocketServer({
          getRequestHandler: (socket) => {
            return {
              requestResponse({ data, metadata: { q: entrypoint } }) {
                return new Single(subscriber => {
                  subscriber.onSubscribe();
                  if (Object.keys(self._listeners).includes(entrypoint)) {
                    const callback = self._listeners[entrypoint];
                    if (typeof callback !== 'function') {
                      throw new Error(errors.wrongCallbackForListen);
                    }
                    const request = { data, entrypoint, headers: { type: 'requestResponse' } };
                    const observable = callback(request);
                    if (!utils.isObservable(observable)) {
                      throw new Error(errors.wrongCallbackForListen);
                    }
                    observable
                      .elementAt(0)
                      .subscribe(response => subscriber.onComplete({ data: response }));
                  }
                });
              },
              requestStream({ data, metadata: { q: entrypoint, responsesLimit } }) {
                return new Flowable(subscriber => {
                  const hasNoLimit = !responsesLimit;
                  let isStreamCanceled = false;
                  let subscription;
                  let updates = 0;
                  let hasEmittedOnce = false;
                  let $proxy = new ReplaySubject();
                  const handleIsStreamCanceledCase = () => {
                    subscription && subscription.unsubscribe();
                    return false;
                  };
                  subscriber.onSubscribe({
                    cancel: () => { isStreamCanceled = true; },
                    request: n => {
                      if (isStreamCanceled || !Object.keys(self._listeners).includes(entrypoint)) {
                        return handleIsStreamCanceledCase();
                      }

                      const callback = self._listeners[entrypoint];
                      if (typeof callback !== 'function') {
                        throw new Error(errors.wrongCallbackForListen);
                      }
                      const request = { data, entrypoint, headers: { type: 'requestStream' } };
                      const observable = self._listeners[entrypoint](request);
                      if (!utils.isObservable(observable)) {
                        throw new Error(errors.wrongCallbackForListen);
                      }

                      if (hasNoLimit && updates > 0) {
                        $proxy.elementAt(updates).subscribe((response) => subscriber.onNext({ data: response }));
                      } else {
                        subscription = observable.subscribe(
                          response => {
                            if (isStreamCanceled) {
                              return handleIsStreamCanceledCase();
                            }
                            if (hasNoLimit) {
                              $proxy.next(response);
                              if (!hasEmittedOnce) {
                                subscriber.onNext({ data: response });
                              }
                              hasEmittedOnce = true;
                            } else {
                              subscriber.onNext({ data: response });
                            }
                          },
                          error => subscriber.onError(error),
                          () => subscriber.onComplete()
                        );
                      }

                      updates++;
                    }
                  });
                });
              }
            };
          },
          serializers: JsonSerializers,
          transport: new RSocketWebSocketServer({
            ...serverConfig,
            protocol: 'ws'
          })
        });
        this._server.start();
      } catch(error) {
        reject(errors.cantStartServer)
      }
      return resolve();
    })

  }

  listen(path, callback) {
    this._listeners[path] = callback;
  }

  destroy(): Promise<void> {
    return new Promise((resolve) => {
      this._server.stop();
      resolve();
    });
  }

}
