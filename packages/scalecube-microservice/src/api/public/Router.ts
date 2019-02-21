import { Reference, RouteOptions } from '.';

export default interface Router {
  route: (routeOptions: RouteOptions) => Reference;
}
