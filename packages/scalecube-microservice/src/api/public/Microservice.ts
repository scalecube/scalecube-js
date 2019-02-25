import { ProxyOptions, ServiceCall, CreateServiceCallOptions } from '.';

export default interface Microservice {
  destroy: () => null;

  createProxy<T = any>(proxyOptions: ProxyOptions): T;

  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
