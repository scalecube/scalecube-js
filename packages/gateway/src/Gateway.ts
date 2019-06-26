// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import RSocketWebSocketServer from 'rsocket-websocket-server';
// @ts-ignore
import { Single } from 'rsocket-flowable';
import { Gateway as GatewayInterface } from './api';

export class Gateway implements GatewayInterface {
  private port: number;
  private server: any;
  private transport: any;
  constructor(port: number) {
    this.port = port;
    this.transport = new RSocketWebSocketServer({ port });
  }
  start(opts: any) {
    const { serviceCall } = opts;
    this.server = new RSocketServer({
      getRequestHandler: (socket: any) => {
        return {
          requestResponse: (payload: any) => requestResponse(payload, serviceCall),
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
  console.log('HHHHHHHHHHHHH', serviceCall);
  const { data, metadata } = payload;
  console.log('Request:', data, metadata);
  return new Single((subscriber: any) => {
    subscriber.onSubscribe();
    serviceCall({
      message: JSON.parse(data),
      asyncModel: 'requestResponse',
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
