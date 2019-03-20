import { Endpoint, RouteOptions } from '.';

/**
 * Specifies logic for picking the most appropriate remoteService
 */
export default interface Router {
  /**
   * The method that returns the appropriate remoteService for the provided search criteria. Returns null if no
   * appropriate remoteService was found
   */
  route: (routeOptions: RouteOptions) => Endpoint | null;
}
