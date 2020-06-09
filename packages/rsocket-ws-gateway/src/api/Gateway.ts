import { MicroserviceApi } from '@scalecube/api';

export type RequestHandler = (serviceCall: MicroserviceApi.ServiceCall, data: any, subscriber: any) => void;

export interface GatewayOptions {
  port: number;
  requestResponse?: RequestHandler;
  requestStream?: RequestHandler;
}

export interface GatewayStartOptions {
  serviceCall: MicroserviceApi.ServiceCall;
}

export interface Gateway {
  // constructor(options: GatewayOptions): Gateway;
  /**
   * gateway provider implementation
   * start to listen on a port (ws/ rsocket/ ...)
   * handle incoming requests
   */
  start: (options: GatewayStartOptions) => void;
  /**
   * stop gateway
   */
  stop: () => void;
}
