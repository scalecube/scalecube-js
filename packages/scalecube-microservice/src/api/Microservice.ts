import { ProxyOptions, ServiceCall, CreateServiceCallOptions, Router, ProxiesMap } from '.';

/**
 * Provides the functionality of a microservice container
 */
export default interface Microservice {
  /**
   * The method is used to delete a microservice and close all the subscriptions related with it
   */
  destroy(): null;

  /**
   * Create a map of Promises to proxy.
   */
  requestProxies(proxyOptions: ProxyOptions, router?: Router): ProxiesMap;

  /**
   * Exposes serviceCall to a user (not via Proxy)
   */
  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
