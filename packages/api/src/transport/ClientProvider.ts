import { ProviderFactory } from '.';
import { PayloadSerializers } from './Transport';

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

  /**
   * @property
   * Optional serialize functionality for the payload
   */
  serializers?: PayloadSerializers;
}
