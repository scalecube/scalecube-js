import { RSocketServer } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Single } from 'rsocket-flowable';
import { JsonSerializers } from 'rsocket-core';

const requestResponseHandler = (data, q) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let responseData;
      switch(q) {
        case '/greeting/one': {
          responseData = `Echo:${data}`;
          break;
        }
        case '/greeting/pojo/one': {
          responseData = { test: `Echo:${data}` };
          break;
        }
      }
      resolve({ data: responseData })
    }, 100);
  });
};

const server = new RSocketServer({
  getRequestHandler: (socket, payload) => {

    // socket.on('close', (data) => {
    //   console.log('data close', data);
    // });
    console.log('socket', socket);

    return {
      requestResponse({ data, metadata: { q } }) {

        console.log('in server', data, q);

        return new Single(subscriber => {
          requestResponseHandler(data, q).then(response => subscriber.onComplete(response));
          subscriber.onSubscribe();
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
