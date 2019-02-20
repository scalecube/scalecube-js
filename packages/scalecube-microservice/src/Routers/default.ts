import { lookUp } from '../Microservices/ServiceRegistry';
import { RouteOptions, Endpoint } from '../api/public';

export const defaultRouter = Object.freeze({
  route: ({ qualifier, serviceRegistry }: RouteOptions): Endpoint => {
    const endpoints = lookUp({ serviceRegistry, qualifier });
    if (!endpoints) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return endpoints[0];
    }
  },
});
