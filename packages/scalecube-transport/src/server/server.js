import { RSocketServer } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Single, Flowable } from 'rsocket-flowable';
import { JsonSerializers } from 'rsocket-core';
import {
  getFailingManyResponse,
  getFailingOneResponse,
  getTextResponseMany,
  getTextResponseSingle
} from '../../src/utils';

const requestResponseHandler = (data, q) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let responseData;
      switch(q) {
        case '/greeting/one': {
          responseData = getTextResponseSingle(data);
          break;
        }
        case '/greeting/failing/one': {
          responseData = getFailingOneResponse(data);
          break;
        }
        case '/greeting/pojo/one': {
          responseData = { text: getTextResponseSingle(data.text) };
          break;
        }
      }
      resolve({ data: responseData })
    }, 100);
  });
};

const server = new RSocketServer({
  getRequestHandler: (socket) => {
    return {
      requestResponse({ data, metadata: { q } }) {
        return new Single(subscriber => {
          requestResponseHandler(data, q).then(response => subscriber.onComplete(response));
          subscriber.onSubscribe();
        });
      },
      requestStream({ data, metadata: { q } }) {
        return new Flowable(subscriber => {
          let index = 0;
          subscriber.onSubscribe({
            cancel: () => {},
            request: n => {
              if (q.includes('/one')) {
                requestResponseHandler(data, q).then(response => {
                  subscriber.onNext(response);
                  subscriber.onComplete();
                });
              } else {
                while(n--) {
                  setTimeout(() => {
                    if (q === '/greeting/failing/many') {
                      if (index < 2) {
                        subscriber.onNext({ data: getTextResponseSingle(data) });
                        index++;
                      } else {
                        subscriber.onNext({ data: getFailingManyResponse(data) });
                        subscriber.onComplete();
                      }
                    } else {
                      subscriber.onNext({ data: getTextResponseMany(index++)(data) });
                    }
                  }, 100);
                }
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

export const startServer = () => server.start();

export const stopServer = () => server.stop();
