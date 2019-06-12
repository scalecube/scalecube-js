import { ProviderFactory } from '.';

/**
 * @interface ServerProvider
 */
export default interface ServerProvider {
  /**
   * @method
   * Factory for creating RSocket server transport provider
   */
  serverFactory: ProviderFactory;
  /**
   * @property
   * Extra configuration to pass to the factory
   */
  serverOptions?: any;
}
