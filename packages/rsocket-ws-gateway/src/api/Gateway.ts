import { MicroserviceApi } from '@scalecube/api';

export interface GatewayOptions {
  port: number;
  requestResponse?: any;
  requestStream?: any;
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
