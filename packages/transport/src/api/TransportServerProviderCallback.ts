import { Address } from './index';
/**
 * Custom server transport provider
 * TransportServer - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketServer.js
 */
// @ts-ignore
export type TransportServerProviderCallback = (options: {
  address: Address;
  remoteTransportServerProviderOptions: null;
}) => TransportServer;

/**
 * import { TransportServer } from 'rsocket-core';
 */
type TransportServer = any;
