import { RouteOptions, Endpoint } from '../api/public';

export const defaultRouter = Object.freeze({
  route: ({ message, lookUp }: RouteOptions): Endpoint => {
    const { qualifier } = message;
    const endpoints = lookUp({ qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return endpoints[0];
    }
  },
});
