import { ServiceCall } from '../helpers/types';

// interface GatewayOptions {
//   port: number;
// }

export interface Gateway {
  // constructor(options: GatewayOptions): Gateway;
  /**
   * gateway provider implementation
   * start to listen on a port (ws/ rsocket/ ...)
   * handle incoming requests
   */
  start: (options: { serviceCall: ServiceCall }) => void;
  /**
   * stop gateway
   */
  stop: () => void;
}
