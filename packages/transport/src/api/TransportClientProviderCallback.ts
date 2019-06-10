import { Address } from './index';

/**
 * Custom client transport provider
 * DuplexConnection - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketClient.js
 */
export type TransportClientProviderCallback = (options: {
  address: Address;
  remoteTransportClientProviderOptions: any;
}) => DuplexConnection;

/**
 * import { DuplexConnection } from 'rsocket-core';
 */
type DuplexConnection = any;
