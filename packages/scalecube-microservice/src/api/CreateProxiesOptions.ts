import { ProxiesOptions, Router } from './index';

/**
 * The options that are used for the creation of the proxies for the specific microservice container
 */
export default interface CreateProxiesOptions {
  /**
   * List of ProxiesOptions, contain the configuration for creating the proxy
   */
  proxies: ProxiesOptions[];
  /**
   * optional router to provide extra logic (remoteCall)
   * default is defaultRouter
   */
  router?: Router;
  /**
   * optional flag to resolve the proxy asynchronous way
   * if true then the proxy will be resolved when the service is in the registry
   * if false then the proxy will be resolved immediately
   * default is false.
   */
  isAsync?: boolean;
}
