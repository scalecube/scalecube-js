import { RouteOptions, Endpoint } from '../api/public';

export const defaultRouter = Object.freeze({
  route: ({ message, registry }: RouteOptions): Endpoint => {
    const { qualifier } = message;
    const endpoints = registry.lookUpRemote({ qualifier });
    if (!endpoints) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return endpoints[0];
    }
  },
});
