import { TransportClientProviderCallback } from './index';
/**
 * @interface RemoteTransportClientProvider
 */
export default interface RemoteTransportClientProvider {
  /**
   * @method
   * Client transport implementation
   */
  transportClientProviderCallback: TransportClientProviderCallback;
  /**
   * @property
   * Client transport configurations
   */
  remoteTransportClientProviderOptions?: any;
}
