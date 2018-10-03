// @flow
import { Observable } from 'rxjs';
import { TransportRequest, TransportClientProviderConfig, TransportServerProviderConfig } from './types';
import { TransportClientProvider } from './TransportClientProvider';

export interface Transport {
  constructor(): Transport;
    /**
   * Method is used to set to a specific provider to the transport instance and build it with the provided config
   *
   * @param Provider -  the class, that is used to create an instance of provider.
   * @param transportProviderConfig - the configuration, that is used to build the provider
   * @returns a promise that is resolved with void when the provider is built and ready to be used. The promise can be rejected due to validation errors of provided config or inability to connect to a provided URI
   */
  setProvider(Provider: Class<TransportClientProvider>, transportProviderConfig: TransportClientProviderConfig | TransportServerProviderConfig): Promise<void>;
  /**
   * Method is used to send a request to a server using the provided previously provider.
   *
   * @param transportRequest - headers, data and entrypoint of the request.
   * @returns an observable, that represents the sequence of data that is extracted from the responses from a server. The observable will emit an error, if no provider was being set on the transport or if connection is lost
   */
  request(transportRequest: TransportRequest): Observable<any>;
  /**
   * Method is used to listen for requests using the provided previously provider.
   *
   * @param path to listen
   * @param (transportRequest: TransportRequest) => Observable<any> callback when path hit
   * @returns a promise that is resolved with void when a callback is added or is rejected when no serverProvider is available in Transport or when a second arg is not a function
   */
  listen(path: string, (transportRequest: TransportRequest) => Observable<any>): Promise<void>;
  /**
   * Method is used to remove providers from a transport and close all the active connections.
   *
   * @returns a promise that resolves with void, when providers are removed and all the connections are closed. The promise can be rejected, if no provider is being set on transport
   */
  removeProvider(): Promise<void>;
}
