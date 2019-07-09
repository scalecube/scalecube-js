import { Endpoint, LookUp, Message } from '.';

/**
 * @interface Router
 * Specifies logic for picking the most appropriate remoteService
 */
export interface Router {
  /**
   * @method
   * The method that returns the appropriate remoteService for the provided search criteria. Returns null if no
   * appropriate remoteService was found
   */
  route: (options: RouterOptions) => Endpoint | null;
}

/**
 * @interface RouteOptions
 * The options that are used for the creation of the custom router
 */
export interface RouterOptions {
  /**
   * @method
   * The function that finds removeService by given criteria
   */
  lookUp: LookUp;
  /**
   * @property
   * Data that is used for executing the call of service method
   */
  message: Message;
}
