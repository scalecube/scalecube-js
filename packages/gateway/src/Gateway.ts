import { Observable } from 'rxjs';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketServer from 'rsocket-websocket-server';
// @ts-ignore
import { Single, Flowable } from 'rsocket-flowable';
import { Api } from '@scalecube/scalecube-microservice';

export class Gateway implements Api.Gateway {
  private port: number;
  private server: any;
  private transport: any;
  constructor(options) {
    const { port } = options;
    this.port = port;
    this.transport = new RSocketWebSocketServer({ port });
  }
  start(opts: any) {
    const { serviceCall } = opts;
    this.server = new RSocketServer({
      getRequestHandler: (socket: any) => {
        return {
          requestResponse: (payload: any) => requestResponse(payload, serviceCall),
          requestStream: (payload: any) => requestStream(payload, serviceCall),
        };
      },
      transport: this.transport,
    });
    this.server.start();
    console.log('Gateway started on port: ' + this.port);
  }
  stop() {
    this.server.stop();
    console.log('Gateway stopped');
  }
}

const requestResponse = (payload: any, serviceCall: any) => {
  const { data, metadata } = payload;
  console.log('Request:', data, metadata);
  return new Single((subscriber: any) => {
    subscriber.onSubscribe();
    serviceCall({
      message: JSON.parse(data),
      asyncModel: 'requestResponse',
      // includeMessage: true,
    })
      .then((resp: any) => {
        console.log('RESP', resp);
        subscriber.onComplete({ data: JSON.stringify(resp), metadata: 'my_response_metadata' });
      })
      .catch((err: any) => {
        subscriber.onError(err);
      });
  });
};
const requestStream = (payload: any, serviceCall: any) => {
  console.log('rS', payload);
  const { data, metadata } = payload;
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    (serviceCall({
      message,
      asyncModel: 'requestStream',
    }) as Observable<any>).subscribe(
      (response: any) => {
        subscriber.onNext({ data: JSON.stringify(response), metadata: '' });
      },
      (error: any) => subscriber.onError(error),
      () => subscriber.onComplete()
    );
  });
};
