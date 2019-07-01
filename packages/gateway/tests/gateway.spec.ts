import { Observable, from } from 'rxjs';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { makeConnection } from './helpers/utils';

let gateway, socket: any;

beforeAll(async () => {
  ({ gateway, socket } = await makeConnection());
});

afterAll(() => gateway.stop());

class serviceA {
  ping(arg: any) {
    console.log('AAAA', arg);
    return Promise.resolve({ response: arg.request + ' pong' });
  }
  twise(arg: any) {
    console.log('BBBB', arg);
    return from([arg, arg]);
  }
}
const definition = {
  serviceName: 'serviceA',
  methods: {
    ping: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    twise: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
  },
};

const ms = Microservices.create({
  services: [{ definition, reference: new serviceA() }],
  gateway: new Gateway(8082),
});
const pr = ms.createProxy({ serviceDefinition: definition });

test('ping => pong', () => {
  pr.ping()
    .then((r: any) => {
      console.log('R: ', r);
    })
    .catch((e: any) => {
      console.error(e);
    });
});

const client = new RSocketClient({
  setup: {
    dataMimeType: 'application/json',
    keepAlive: 1000,
    lifetime: 1000,
    metadataMimeType: 'application/json',
  },
  transport: new RSocketWebSocketClient({ url: 'ws://localhost:8082' }),
});
const msgRequest = {
  data: JSON.stringify({
    qualifier: 'serviceA/ping',
    data: [{ request: 'ping' }],
  }),
  metadata: 'request_metadata',
};
const msgRequest2 = {
  data: JSON.stringify({
    qualifier: 'serviceA/twise',
    data: [{ request: 'ping' }],
  }),
  metadata: 'request_metadata',
};
test.only('connect', (done) => {
  client.connect().subscribe({
    onComplete: (socket: any) => {
      console.log('Connected', socket);
      socket.requestResponse(msgRequest).subscribe({
        onComplete: (args: any) => {
          const { data, metadata } = args;
          const res = JSON.parse(data);
          console.log('Response', data, metadata);
          // expect(res).toEqual({ response: 'ping pong' });
          // done();
        },
        onError: (e: any) => {
          console.error('Eee', e);
          done();
        },
      }); // Single type
      socket.requestStream(msgRequest2).subscribe({
        onSubscribe(subscription: any) {
          subscription.request(2);
        },
        onNext: (args: any) => {
          const { data, metadata } = args;
          const res = JSON.parse(data);
          console.log('Stream Response', data, metadata);
          // expect(res).toEqual({ response: 'ping pong' });
          // done();
        },
        onError: (e: any) => {
          console.error('Eee', e);
          done();
        },
        onComplete: () => {
          console.log('complete');
          done();
        },
      }); // Single type
    },
    onError: (error: any) => {
      console.log('Err', error);
    },
  });
});
