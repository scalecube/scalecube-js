import { RawService, RouteOptions } from '.';

export default interface Router {
  route: (routeOptions: RouteOptions) => RawService;
}
