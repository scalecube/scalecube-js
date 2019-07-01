import { Observable, from } from 'rxjs';
import { RSocketClient } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { makeConnection } from './helpers/utils';

let gateway: Gateway, socket: any;

beforeAll(async () => {
  ({ gateway, socket } = await makeConnection());
});

afterAll(() => gateway.stop());

test('success requestResponse', (done) => {
  socket
    .requestResponse({
      data: JSON.stringify({
        qualifier: 'serviceA/methodA',
        data: [{ request: 'ping' }],
      }),
    })
    .subscribe({
      onComplete: (args: any) => {
        const { data, metadata } = args;
        const res = JSON.parse(data);
        console.log('Response', data, metadata);
        expect(res).toEqual({ id: 1 });
        done();
      },
      onError: (e: any) => {
        done.fail(e);
      },
    });
});

test('fail requestResponse', (done) => {
  socket
    .requestResponse({
      data: JSON.stringify({
        qualifier: 'serviceA/methodB',
        data: [{ request: 'ping' }],
      }),
    })
    .subscribe({
      onError: (e: any) => {
        // console.error('ERR', e.source);
        expect(e.source.message).toEqual('methodB error');
        done();
      },
    });
});
