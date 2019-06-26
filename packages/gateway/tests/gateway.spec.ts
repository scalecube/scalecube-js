// @ts-ignore
import { RSocketClient } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';

class serviceA {
  ping(arg: any) {
    console.log('AAAA', arg);
    return Promise.resolve({ response: arg.request + ' pong' });
  }
}
const definition = {
  serviceName: 'serviceA',
  methods: {
    ping: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};

const ms = Microservices.create({
  services: [{ definition, reference: new serviceA() }],
  gateway: new Gateway(8081),
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
  transport: new RSocketWebSocketClient({ url: 'ws://localhost:8081' }),
});
const msgRequest = {
  data: JSON.stringify({
    qualifier: 'serviceA/ping',
    data: [{ request: 'ping' }],
  }),
  metadata: 'request_metadata',
};
test.only('connect', (done) => {
  client.connect().subscribe({
    onComplete: (socket: any) => {
      console.log('Connected');
      socket.requestResponse(msgRequest).subscribe({
        onComplete: (args: any) => {
          const { data, metadata } = args;
          const res = JSON.parse(data);
          console.log('Response', data, metadata);
          expect(res).toEqual({ response: 'ping pong' });
          done();
        },
        onError: (e: any) => {
          console.error('Eee', e);
          done();
        },
      }); // Single type
    },
    onError: (error: any) => {
      console.log('Err', error);
    },
  });
});
