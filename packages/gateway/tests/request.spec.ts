import { Observable, from } from 'rxjs';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { makeConnection } from './helpers/utils';

let gateway: Gateway, socket: any;

beforeAll(async () => {
  ({ gateway, socket } = await makeConnection());
});

afterAll(() => gateway.stop());

test.only('success requestResponse', (done) => {
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
        // expect(res).toEqual({ response: 'ping pong' });
        // done();
      },
      onError: (e: any) => {
        console.error('Eee', e);
        done.fail();
      },
    }); // Single type
});
