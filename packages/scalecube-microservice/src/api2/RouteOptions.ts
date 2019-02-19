import { ServiceRegistry } from '.';

export default interface RouteOptions {
  serviceRegistry: ServiceRegistry;
  qualifier: string;
}
