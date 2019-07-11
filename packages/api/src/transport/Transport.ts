import { ClientProvider, ServerProvider } from '.';

/**
 * @interface Provider
 *
 */
export default interface Transport {
  /**
   * @property
   * transport provider for the client
   */
  clientProvider: ClientProvider;
  /**
   * @property
   * transport provider for the server
   */
  serverProvider: ServerProvider;
}

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
