import { ClientProvider, ServerProvider } from '.';
/**
 * @interface Provider
 *
 */
export default interface Transport {
  /**
   * @property
   *
   */
  clientProvider: ClientProvider;
  /**
   * @property
   *
   */
  serverProvider: ServerProvider;
}
