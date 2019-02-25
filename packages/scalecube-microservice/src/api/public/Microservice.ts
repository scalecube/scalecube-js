import { ProxyOptions, ServiceCall, CreateServiceCallOptions } from '.';

export default interface Microservice {
  destroy: () => null;

  createProxy<T>(proxyOptions: ProxyOptions): T;

  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
