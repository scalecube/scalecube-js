import { Observable, from } from 'rxjs';
import { RSocketClient } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { makeConnection } from './helpers/utils';

let gateway: Gateway;
let socket;

beforeAll(async () => {
  ({ gateway, socket } = await makeConnection());
});

afterAll(() => gateway.stop());

test('success requestResponse', (done) => {
  socket
    .requestResponse({
      data: {
        qualifier: 'serviceA/methodA',
        data: [{ request: 'ping' }],
      },
    })
    .subscribe({
      onComplete: ({ data }) => {
        // console.log('Response', data, metadata);
        expect(data).toEqual({ id: 1 });
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
      data: {
        qualifier: 'serviceA/methodB',
        data: [{ request: 'ping' }],
      },
    })
    .subscribe({
      onError: (e: any) => {
        // console.error('ERR', e.source);
        expect(e.source.message).toEqual('methodB error');
        done();
      },
    });
});

test('success requestStream', (done) => {
  const responses = [1, 2];
  socket
    .requestStream({
      data: {
        qualifier: 'serviceA/methodC',
        data: [{ request: 'ping' }],
      },
    })
    .subscribe({
      onSubscribe(subscription) {
        subscription.request(2);
      },
      onNext: ({ data }) => {
        expect(data).toEqual(responses.shift());
      },
      onComplete: () => {
        done();
      },
      onError: (e: any) => {
        done.fail(e);
      },
    });
});

test('fail requestStream', (done) => {
  socket
    .requestStream({
      data: {
        qualifier: 'serviceA/methodD',
        data: [{ request: 'ping' }],
      },
    })
    .subscribe({
      onSubscribe(subscription) {
        subscription.request(2);
      },
      onNext: () => {
        done.fail();
      },
      onComplete: () => {
        done.fail();
      },
      onError: (e: any) => {
        expect(e.source.message).toEqual('methodD error');
        done();
      },
    });
});
