// @flow
import { TransportRequest, ProviderConfig } from './types';
import { ProviderInterface } from './ProviderInterface';
import { Observable } from 'rxjs';

export interface TransportInterface {
  constructor(): TransportInterface;
    /**
   * Method is used to set to a specific provider to the transport instance and build it with the provided config
   *
   * @param Provider -  the class, that is used to create an instance of provider.
   * @param providerConfig - the configuration, that is used to build the provider
   * @returns a promise that is resolved with void when the provider is built and ready to be used. The promise can be rejected due to validation errors of provided config or inability to connect to a provided URI
   */
  setProvider(Provider: Class<ProviderInterface>, providerConfig: ProviderConfig): Promise<void>;
  /**
   * Method is used to send a request to a server using the provided previously provider.
   *
   * @param transportRequest - headers, data and entrypoint of the request.
   * @returns an observable, that represents the sequence of data that is extracted from the responses from a server. The observable will emit an error, if no provider was being set on the transport or if connection is lost
   */
  request(transportRequest: TransportRequest): Observable<any>;
  /**
   * Method is used to remove a provider from a transport and close all the active connections.
   *
   * @returns a promise that resolves with void, when the provider is removed and all the connections are closed. The promise can be rejected, if no provider is being set on transport
   */
  removeProvider(): Promise<void>;
}
