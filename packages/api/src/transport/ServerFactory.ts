import { Address } from '.';
/**
 *
 * DuplexConnection - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketClient.js
 */
// @ts-ignore
export type ServerFactory = (options: { address: Address; serverFactoryOptions: null }) => DuplexConnection;

/**
 * import { DuplexConnection } from 'rsocket-common';
 */
type DuplexConnection = any;
