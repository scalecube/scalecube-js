import RouteRequest from './RouteRequest';

export default interface Router {
  route: (routeRequest: RouteRequest) => object;
}
