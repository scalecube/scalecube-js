import { RSocketServer } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Api } from '@scalecube/scalecube-microservice';
import { requestResponse } from './requestResponse';
import { requestStream } from './requestStream';

export class Gateway implements Api.Gateway {
  private port: number;
  private server;
  private transport;
  constructor(options) {
    const { port } = options;
    this.port = port;
    this.transport = new RSocketWebSocketServer({ port });
  }
  public start(opts) {
    const { serviceCall } = opts;
    this.server = new RSocketServer({
      getRequestHandler: (socket) => {
        return {
          requestResponse: (payload) => requestResponse(payload, serviceCall),
          requestStream: (payload) => requestStream(payload, serviceCall),
        };
      },
      transport: this.transport,
    });
    this.server.start();
    // console.log('Gateway started on port: ' + this.port);
  }
  public stop() {
    this.server.stop();
    // console.log('Gateway stopped');
  }
}
