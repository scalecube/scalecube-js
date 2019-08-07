import { Router, ServiceDefinition } from '.';
/**
 * @interface CreateProxies
 *
 */
export type CreateProxies = (options: CreateProxiesOptions) => ProxiesMap;

/**
 * @interface CreateProxiesOptions
 * The options that are used for the creation of the proxies for the specific microservice container
 */
export interface CreateProxiesOptions {
  /**
   * @property
   * List of ProxiesOptions, contain the configuration for creating the proxy
   */
  proxies: ProxiesOptions[];
  /**
   * @method
   * optional router to provide extra logic (remoteCall)
   * default is defaultRouter
   */
  router?: Router;
  /**
   * @property
   * optional flag to resolve the proxy asynchronous way
   * if true then the proxy will be resolved when the service is in the registry
   * if false then the proxy will be resolved immediately
   * default is false.
   */
  isAsync?: boolean;
}

/**
 * options for creating proxies
 */
export interface ProxiesOptions {
  /**
   * name of the proxy (used as the key in the map)
   */
  proxyName: string;
  /**
   * metadata of the service
   */
  serviceDefinition: ServiceDefinition;
}

/**
 * @interface ProxiesMap
 * Map of generic proxyName and a Promise to the proxy
 */
export interface ProxiesMap {
  [proxyName: string]: Promise<{ proxy: Proxy }> | Proxy;
}

type Proxy<T = any> = T;
