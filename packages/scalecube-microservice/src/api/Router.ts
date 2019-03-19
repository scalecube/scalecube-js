import { Endpoint, RouteOptions } from '.';

/**
 * Allows to specify the logic of which instance of the required endpoint should be returned for the future call
 */
export default interface Router {
  /**
   * The method that returns the appropriate endpoint for the provided search criteria. Returns null of no
   * appropriate endpoint was found
   */
  route: (routeOptions: RouteOptions) => Endpoint | null;
}
