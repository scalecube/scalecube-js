import { Service, RouteOptions } from './index';

export default interface Router {
  route: (routeOptions: RouteOptions) => Service;
}
