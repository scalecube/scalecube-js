import { Service, RouteOptions } from '.';

export default interface Router {
  route: (routeOptions: RouteOptions) => Service;
}
