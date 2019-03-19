import { ProxyOptions, ServiceCall, CreateServiceCallOptions } from '.';

/**
 * Microservice container, that incapsulates the logic for a given microservice
 */
export default interface Microservice {
  /**
   * The method is used to delete microservice and close all the subscriptions related with it
   */
  destroy: () => null;
  /**
   * The method is used to get a proxy, that allows to easily call any method from any of the service that was
   * provided while creating microservice container
   */
  createProxy<T = any>(proxyOptions: ProxyOptions): T;
  /**
   * The method is used to get a proxy, that allows to easily call any method from any of the service that was
   * provided while creating microservice container
   */
  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
