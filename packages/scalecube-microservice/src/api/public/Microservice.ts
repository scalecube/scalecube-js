import { ProxyOptions, ServiceCall, CreateServiceCallOptions } from '.';

export default interface Microservice {
  destroy: () => null;
  createProxy<T>(proxyOptions: ProxyOptions): Proxy<T>;

  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
