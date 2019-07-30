import { RSocketServer, JsonSerializers } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Gateway as GatewayInterface, GatewayStartOptions } from './api/Gateway';
import { requestResponse } from './requestResponse';
import { requestStream } from './requestStream';
import { RsocketEventsPayload } from './api/types';

export class Gateway implements GatewayInterface {
  private port: number;
  private server;
  private transport;
  constructor(options) {
    const { port } = options;
    this.port = port;
    this.transport = new RSocketWebSocketServer({ port });
  }
  public start(opts: GatewayStartOptions) {
    const { serviceCall } = opts;
    this.server = new RSocketServer({
      serializers: JsonSerializers,
      getRequestHandler: (socket) => {
        return {
          requestResponse: (payload: RsocketEventsPayload) => requestResponse(payload, serviceCall),
          requestStream: (payload: RsocketEventsPayload) => requestStream(payload, serviceCall),
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
