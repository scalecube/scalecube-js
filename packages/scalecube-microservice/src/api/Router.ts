import { Endpoint, RouteOptions } from './public';

export default interface Router {
  route: (routeOptions: RouteOptions) => Endpoint | null;
}
