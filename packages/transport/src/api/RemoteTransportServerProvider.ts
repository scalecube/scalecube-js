import { TransportServerProviderCallback } from './index';
/**
 * @interface RemoteTransportServerProvider
 */
export default interface RemoteTransportServerProvider {
  /**
   * @method
   * Server transport implementation
   */
  transportServerProviderCallback: TransportServerProviderCallback;
  /**
   * @property
   * Server transport configurations
   */
  remoteTransportServerProviderOptions?: any;
}
