import { ProxyOptions, ServiceCall, CreateServiceCallOptions, ProxiesMap, CreateProxiesOptions } from '.';

/**
 * Provides the functionality of a microservice container
 */
export default interface Microservice {
  /**
   * The method is used to delete a microservice and close all the subscriptions related with it
   */
  destroy(): Promise<string>;

  /**
   * Create a map of proxies or Promises to proxy. (deepened on configuration)
   */
  createProxies(proxyOptions: CreateProxiesOptions): ProxiesMap;

  /**
   * Creates a proxy to a method and provides extra logic when is invoked
   */
  createProxy<T = any>(proxyOptions: ProxyOptions): T;

  /**
   * Exposes serviceCall to a user (not via Proxy)
   */
  createServiceCall(options: CreateServiceCallOptions): ServiceCall;
}
