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
          requestResponse({ data, metadata: { q } }) {
            return new Single(subscriber => {
              subscriber.onSubscribe();
              console.log('q', q);
              console.log('Object.keys(self._listeners)', self._listeners);
              if (Object.keys(self._listeners).includes(q)) {
                self._listeners[q](data).subscribe(response => {
                  subscriber.onComplete({ data: response });
                });
              }
              // requestResponseHandler(data, q).then(response => subscriber.onComplete(response));
            });
          },
          requestStream({ data, metadata: { q } }) {
            // return new Flowable(subscriber => {
            //   let index = 0;
            //   let isStreamCanceled = false;
            //   subscriber.onSubscribe({
            //     cancel: () => { isStreamCanceled = true },
            //     request: n => {
            //       if (q.includes('/one')) {
            //         requestResponseHandler(data, q).then(response => {
            //           subscriber.onNext(response);
            //           subscriber.onComplete();
            //         });
            //       } else {
            //         while(n--) {
            //           setTimeout(() => {
            //             if (isStreamCanceled) {
            //               return false;
            //             }
            //             if (q === '/greeting/failing/many') {
            //               if (index < 2) {
            //                 subscriber.onNext({ data: getTextResponseSingle(data) });
            //                 index++;
            //               } else {
            //                 subscriber.onNext({ data: getFailingManyResponse(data) });
            //                 subscriber.onComplete();
            //               }
            //             } else {
            //               subscriber.onNext({ data: getTextResponseMany(index++)(data) });
            //             }
            //           }, 100);
            //         }
            //       }
            //     }
            //   });
            // });
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

// const requestResponseHandler = (data, q) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       let responseData;
//       switch(q) {
//         case '/greeting/one': {
//           responseData = getTextResponseSingle(data);
//           break;
//         }
//         case '/greeting/many': {
//           responseData = getTextResponseMany(0)(data);
//           break;
//         }
//         case '/greeting/failing/one': {
//           responseData = getFailingOneResponse(data);
//           break;
//         }
//         case '/greeting/pojo/one': {
//           responseData = { text: getTextResponseSingle(data.text) };
//           break;
//         }
//       }
//       resolve({ data: responseData })
//     }, 100);
//   });
// };
