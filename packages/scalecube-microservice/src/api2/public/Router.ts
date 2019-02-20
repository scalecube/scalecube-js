import { Endpoint, RouteOptions } from '.';

export default interface Router {
  route: (routeOptions: RouteOptions) => Endpoint;
}
