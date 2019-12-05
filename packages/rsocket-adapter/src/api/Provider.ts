import { Address } from '@scalecube/api';

export interface Provider {
  /**
   * @method
   * Factory for creating RSocket client transport provider
   */
  providerFactory: ProviderFactory;
  /**
   * @property
   * Extra configuration to pass to the factory
   */
  factoryOptions?: any;

  /**
   * @property
   * Optional serialize functionality for the payload
   */
  serializers?: PayloadSerializers;

  /**
   * @property
   * Optional setup configuration for the provider
   */
  setup?: ProviderSetup;
}

/**
 * @interface ClientProviderSetup
 */
export interface ProviderSetup {
  dataMimeType?: string;
  keepAlive?: number;
  lifetime?: number;
  metadataMimeType?: string;
}

/**
 * @function
 * RSocket transport provider factory
 * DuplexConnection - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketClient.js
 */
export type ProviderFactory = (options: { address: Address; factoryOptions?: any }) => DuplexConnection;

/**
 * import { DuplexConnection } from 'rsocket-core';
 */
type DuplexConnection = any;

/**
 * PayloadSerializers - https://github.com/rsocket/rsocket-js/blob/master/packages/rsocket-core/src/RSocketSerialization.js
 */
export interface PayloadSerializers {
  data: {
    deserialize: (data: any) => any;
    serialize: (data: any) => any;
  };
  metadata: {
    deserialize: (data: any) => any;
    serialize: (data: any) => any;
  };
}
