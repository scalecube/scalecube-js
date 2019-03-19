import { ServiceDefinition, Router } from '.';

/**
 * The options that are used for the creation of the proxy for the specific microservice container
 */
export default interface ProxyOptions {
  /**
   * Custom router helps to specify the logic of choosing the appropriate endpoint, that matches given criteria
   */
  router?: Router;
  /**
   * The metadata for a service container, that includes the name of a service and the map of methods that are
   * included in it
   */
  serviceDefinition: ServiceDefinition;
}
