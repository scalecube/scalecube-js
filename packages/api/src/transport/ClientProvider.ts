import { ClientFactory } from '.';
/**
 * @interface ClientProvider
 */
export default interface ClientProvider {
  /**
   * @method
   *
   */
  clientFactory: ClientFactory;
  /**
   * @property
   * C
   */
  clientFactoryOptions?: any;
}
