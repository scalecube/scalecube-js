import { from, throwError } from 'rxjs';
import { RSocketClient } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../../src/Gateway';

class ServiceA {
  methodA() {
    return Promise.resolve(1);
  }
  methodB() {
    return Promise.reject(new Error('methodB error'));
  }
  methodC() {
    return from([1, 2]);
  }
  methodD() {
    return throwError(new Error('methodC error'));
  }
}

const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodB: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodC: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
    methodD: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
  },
};

type makeConnectionType = (port: number) => Promise<{ gateway: any; socket: any }>;

export const makeConnection: makeConnectionType = (port = 8080) => {
  const gateway = new Gateway({ port });
  const ms = Microservices.create({
    services: [{ definition, reference: new ServiceA() }],
    gateway,
  });
  return new Promise((resolve, reject) => {
    const client = new RSocketClient({
      setup: {
        dataMimeType: 'application/json',
        keepAlive: 1000,
        lifetime: 1000,
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({ url: `ws://localhost:${port}` }),
    });
    client.connect().subscribe({
      onComplete: (socket: any) => {
        console.log('Connected', socket);
        resolve({ gateway, socket });
      },
      onError: (error: any) => {
        console.log('Err', error);
        reject(new Error('Connection error'));
      },
    });
  });
};
