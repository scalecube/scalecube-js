import { Router, ServiceDefinition } from '.';

/**
 * @interface CreateProxy
 *
 */
export type CreateProxy = <T = any>(options: ProxyOptions) => T;

/**
 * @interface ProxyOptions
 * The options that are used for the creation of the proxy for the specific microservice container [deprecated]
 */
export interface ProxyOptions {
  /**
   * @method
   * Custom router specifies the logic of choosing the appropriate remoteService
   */
  router?: Router;
  /**
   * @property
   * The metadata for a service container, that includes the name of a service and the map of methods that are
   * included in it
   */
  serviceDefinition: ServiceDefinition;
}
