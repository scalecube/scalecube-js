import { ProviderFactory } from '.';
/**
 * @interface ClientProvider
 */
export default interface ClientProvider {
  /**
   * @method
   * Factory for creating RSocket client transport provider
   */
  clientFactory: ProviderFactory;
  /**
   * @property
   * Extra configuration to pass to the factory
   */
  factoryOptions?: any;
}
