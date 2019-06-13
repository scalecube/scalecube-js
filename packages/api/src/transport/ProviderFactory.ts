import { Address } from '.';

/**
 * RSocket transport provider factory
 * DuplexConnection - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketClient.js
 */
export type ProviderFactory = (options: { address: Address; factoryOptions?: any }) => DuplexConnection;

/**
 * import { DuplexConnection } from 'rsocket-core';
 */
type DuplexConnection = any;
