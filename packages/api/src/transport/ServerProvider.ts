import { ServerFactory } from '.';

/**
 * @interface ServerProvider
 */
export default interface ServerProvider {
  /**
   * @method
   *
   */
  serverFactory: ServerFactory;
  /**
   * @property
   *
   */
  serverFactoryOptions?: any;
}
