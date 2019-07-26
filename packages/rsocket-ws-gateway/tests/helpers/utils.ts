import { from, throwError } from 'rxjs';
import { RSocketClient, JsonSerializers } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../../src/Gateway';

class ServiceA {
  public methodA() {
    return Promise.resolve({ id: 1 });
  }
  public methodB() {
    return Promise.reject({ code: 'ERR_NOT_FOUND', message: 'methodB error' });
  }
  public methodC() {
    return from([1, 2]);
  }
  // public methodD() {
  //   return throwError(new Error('methodD error'));
  // }
  public methodD() {
    return throwError({ code: 'ERR_NOT_FOUND', message: 'methodD error' });
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

type makeConnectionType = (port?: number) => Promise<{ gateway: any; socket: any }>;

export const makeConnection: makeConnectionType = (port = 8080) => {
  const gateway = new Gateway({ port });
  const ms = Microservices.create({
    services: [{ definition, reference: new ServiceA() }],
    // gateway,
  });
  const serviceCall = ms.createServiceCall({});
  gateway.start({ serviceCall });
  return new Promise((resolve, reject) => {
    const client = new RSocketClient({
      serializers: JsonSerializers,
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
        // console.log('Connected');
        resolve({ gateway, socket });
      },
      onError: (error: any) => {
        // console.log('Err', error);
        reject(new Error('Connection error'));
      },
    });
  });
};
