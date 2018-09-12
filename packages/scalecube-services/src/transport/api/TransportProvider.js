// @flow
import { TransportRequest, TransportProviderConfig } from './types';
import { Observable } from 'rxjs';

export interface TransportProvider {
  constructor(): TransportProvider;
  /**
   * Method is used to prepare all the necessary connections to a server using the provided configuration
   *
   * @param TransportProviderConfig - the configuration, that is used to build the provider
   * @returns a promise that is resolved with void when all the required connections are established. The promise can be rejected dut to validation errors of the config or due to errors during connection
   */
  build(TransportProviderConfig: TransportProviderConfig): Promise<void>;
  /**
   * Method is used to send a request to a server using the provided previously provider.
   *
   * @param transportRequest - headers, data and entrypoint of the request.
   * @returns an observable, that represents the sequence of data that is extracted from the responses from a server. The observable will emit an error, if no provider was being set on the transport or if connection is lost
   */
  request(transportRequest: TransportRequest): Observable<any>;
  /**
   * Method is used to destroy the provider and close all the active connections.
   *
   * @returns a promise that resolves with void, when all the connections are closed. The promise can be rejected, if the provider hasn't been built yet
   */
  destroy(): Promise<void>;
}
