import { ProviderFactory } from '.';
import { PayloadSerializers } from './Transport';

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
  factoryOptions?: any;

  /**
   * @property
   * Optional serialize functionality for the payload
   */
  serializers?: PayloadSerializers;
}
