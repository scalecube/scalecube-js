import { Address } from '.';

/**
 *
 * DuplexConnection - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketClient.js
 */
export type ClientFactory = (options: { address: Address; clientFactoryOptions: any }) => DuplexConnection;

/**
 * import { DuplexConnection } from 'rsocket-common';
 */
type DuplexConnection = any;
