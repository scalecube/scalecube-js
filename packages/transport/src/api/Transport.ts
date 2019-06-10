import { RemoteTransportClientProvider, RemoteTransportServerProvider } from './index';
/**
 * @interface Transport
 *
 */
export default interface Transport {
  /**
   * @property
   * Client transport configurations and implemntation
   */
  remoteTransportClientProvider: RemoteTransportClientProvider;
  /**
   * @property
   * Server transport configurations and implemntation
   */
  remoteTransportServerProvider: RemoteTransportServerProvider;
}
