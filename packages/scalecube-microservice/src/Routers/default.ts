import { lookUp } from '../Microservices/ServiceRegistry';
import RouteOptions from '../api2/public/RouteOptions';

export const defaultRouter = Object.freeze({
  route: ({ qualifier, serviceRegistry }: RouteOptions) => {
    const endpoints = lookUp({ serviceRegistry, qualifier });
    if (!endpoints) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return endpoints[0];
    }
  },
});
