import { RSocketServer, JsonSerializers } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Gateway as GatewayInterface, GatewayOptions, GatewayStartOptions } from './api/Gateway';
import { requestResponse } from './requestResponse';
import { requestStream } from './requestStream';
import { RsocketEventsPayload } from './api/types';
import { validateCustomHandlers, validateServiceCall } from './helpers/validation';

export class Gateway implements GatewayInterface {
  private port: number;
  private started = false;
  private server;
  private transport;
  private requestResponse;
  private requestStream;

  constructor(opts: GatewayOptions) {
    const { port } = opts;
    this.port = port || 3000;
    this.transport = new RSocketWebSocketServer({ port: this.port });
    const { requestResponse: optRequestResponse, requestStream: optRequestStream } = opts;
    validateCustomHandlers('requestResponse', optRequestResponse);
    validateCustomHandlers('requestStream', optRequestStream);

    this.requestResponse = optRequestResponse;
    this.requestStream = optRequestStream;
  }

  public start(opts: GatewayStartOptions) {
    console.log('>>>>>>>>>>>>>>>>');
    if (this.started) {
      this.warn('Gateway is already started');
      return;
    }
    const { serviceCall } = opts;
    validateServiceCall(serviceCall);

    this.server = new RSocketServer({
      serializers: JsonSerializers,
      getRequestHandler: (socket) => {
        return {
          requestResponse: (payload: RsocketEventsPayload) =>
            requestResponse(payload, serviceCall, this.requestResponse),
          requestStream: (payload: RsocketEventsPayload) => requestStream(payload, serviceCall, this.requestStream),
        };
      },
      transport: this.transport,
    });
    this.server.start();
    console.log('Gateway started on port: ' + this.port);
    this.started = true;
  }

  public stop() {
    if (!this.started) {
      this.warn('Gateway is already stopped');
      return;
    }
    this.server.stop();
    // console.log('Gateway stopped');
    this.started = false;
  }

  public warn(message) {
    console.warn(message);
  }
}
