import { LookUp, Message } from '.';

/**
 * The options that are used for the creation of the custom router
 */
export default interface RouteOptions {
  /**
   * The function that provides all the appropriate endpoints for a given search criteria
   */
  lookUp: LookUp;
  /**
   * Data that is used for executing the call of service method
   */
  message: Message;
}
