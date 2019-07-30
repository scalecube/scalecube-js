import { Observable } from 'rxjs';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { RSocketClient, JsonSerializers } from 'rsocket-core';
import { unpackError } from './utils';

export const createGatewayProxy = (url, definition) => {
  const proxy = {};
  let socket;
  return new Promise(async (resolve, reject) => {
    try {
      socket = await connect(url);
    } catch (e) {
      // console.log('Err', e);
      reject(e);
    }
    const { serviceName, methods } = definition;
    Object.keys(methods).forEach((method) => {
      const asyncModel = methods[method].asyncModel;
      const qualifier = `${serviceName}/${method}`;
      proxy[method] = (() => {
        switch (asyncModel) {
          case 'requestResponse':
            return requestResponse(socket, qualifier);
          case 'requestStream':
            return requestStream(socket, qualifier);
          default:
            reject(new Error('Unknown asyncModel'));
        }
      })();
    });
    resolve(proxy);
  });
};

const connect = (url) => {
  return new Promise((resolve, reject) => {
    const client = new RSocketClient({
      serializers: JsonSerializers,
      setup: {
        dataMimeType: 'application/json',
        keepAlive: 100000,
        lifetime: 100000,
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({ url }),
    });
    client.connect().subscribe({
      onComplete: (socket: any) => {
        // console.log('Connected to ' + url);
        resolve(socket);
      },
      onError: (error: any) => {
        // console.log('Err', error);
        reject(new Error('Connection error'));
      },
    });
  });
};

const requestResponse = (socket, qualifier) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      socket
        .requestResponse({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onComplete: ({ data }) => {
            resolve(data);
          },
          onError: (e: any) => {
            reject(unpackError(e));
          },
        });
    });
  };
};

const requestStream = (socket, qualifier) => {
  return (...args) => {
    return new Observable((observer) => {
      socket
        .requestStream({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onSubscribe(subscription) {
            subscription.request(2147483647);
          },
          onNext: ({ data }) => {
            observer.next(data);
          },
          onComplete: () => {
            observer.complete();
          },
          onError: (e: any) => {
            observer.error(unpackError(e));
          },
        });
    });
  };
};
