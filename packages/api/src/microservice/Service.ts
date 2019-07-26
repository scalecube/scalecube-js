import { ServiceDefinition, ServiceReference } from '.';

/**
 * @interface Service
 * Definition and implementation of a service
 */
export interface Service {
  /**
   * @property
   * The metadata for a service, that includes the name of a service and the map of methods that are
   * included in it
   */
  definition: ServiceDefinition;
  /**
   * @property
   * The implementation of a service, that can be an object with methods or a module with a function being exported
   */
  reference: ServiceReference;
}
