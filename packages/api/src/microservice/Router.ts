import { Endpoint, LookUp, Message } from '.';

/**
 * @function Router
 * Specifies logic for picking the most appropriate Endpoint from Endpoint[]
 */
export type Router = (options: RouterOptions) => Endpoint | null;

/**
 * @interface RouteOptions
 * The options that are used for the creation of the custom router
 */
export interface RouterOptions {
  /**
   * @method
   * The function that finds Endpoint by given criteria
   */
  lookUp: LookUp;
  /**
   * @property
   * metadata, contain criteria for picking the Endpoint
   */
  message: Message;
}
